import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto, adminId: string) {
    const categorySlug = slugify(dto.name);

    const existing = await this.categoryRepository.findBySlug(categorySlug);
    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    let level = 0;
    if (dto.parentCategory) {
      const parent = await this.categoryRepository.findById(dto.parentCategory);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
      level = parent.level + 1;
    }

    const category = await this.categoryRepository.create({
      ...dto,
      slug: categorySlug,
      level,
    } as any);

    await this.categoryRepository.logAudit({
      user: adminId,
      action: 'CREATE_CATEGORY',
      entity: 'Category',
      entityId: category._id.toString(),
      newValues: dto,
    });

    this.logger.log(`Category created: ${category.name}`);

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll() {
    const categories = await this.categoryRepository.findAll();

    return {
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  async findTree() {
    const categories = await this.categoryRepository.findAllActive();
    const tree = this.buildTree(categories, null);

    return {
      message: 'Category tree retrieved successfully',
      data: tree,
    };
  }

  async findById(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category || category.deletedAt) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async update(id: string, dto: UpdateCategoryDto, adminId: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category || category.deletedAt) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      (dto as any).slug = slugify(dto.name);
    }

    if (dto.parentCategory) {
      if (dto.parentCategory === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      const parent = await this.categoryRepository.findById(dto.parentCategory);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
      (dto as any).level = parent.level + 1;
    }

    const updated = await this.categoryRepository.update(id, dto as any);

    await this.categoryRepository.logAudit({
      user: adminId,
      action: 'UPDATE_CATEGORY',
      entity: 'Category',
      entityId: id,
      oldValues: category.toObject(),
      newValues: dto,
    });

    this.logger.log(`Category ${id} updated by admin ${adminId}`);

    return {
      message: 'Category updated successfully',
      data: updated,
    };
  }

  async remove(id: string, adminId: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category || category.deletedAt) {
      throw new NotFoundException('Category not found');
    }

    const children = await this.categoryRepository.findByParent(id);
    if (children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.softDelete(id);

    await this.categoryRepository.logAudit({
      user: adminId,
      action: 'DELETE_CATEGORY',
      entity: 'Category',
      entityId: id,
      oldValues: { deletedAt: null },
      newValues: { deletedAt: new Date() },
    });

    this.logger.log(`Category ${id} soft deleted by admin ${adminId}`);

    return { message: 'Category deleted successfully' };
  }

  private buildTree(categories: any[], parentId: string | null): any[] {
    return categories
      .filter((cat) => {
        if (parentId === null) return !cat.parentCategory;
        return cat.parentCategory?.toString() === parentId?.toString();
      })
      .map((cat) => ({
        ...cat.toObject(),
        children: this.buildTree(categories, cat._id),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
