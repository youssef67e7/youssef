import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from '../../database/schemas/medicine.schema';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private trendingSearches: string[] = [];

  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async search(query: string, filters?: any) {
    if (!query || query.trim().length === 0) {
      return { message: 'Search query is required', data: [] };
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    const filter: any = {
      deletedAt: null,
      isActive: true,
      $or: [
        { name: searchRegex },
        { nameAr: searchRegex },
        { description: searchRegex },
        { activeIngredient: searchRegex },
        { tags: { $in: [searchRegex] } },
        { barcode: query.trim() },
        { sku: searchRegex },
      ],
    };

    if (filters) {
      if (filters.category) filter.category = filters.category;
      if (filters.brand) filter.brand = filters.brand;
      if (filters.dosageForm) filter.dosageForm = filters.dosageForm;
      if (filters.minPrice || filters.maxPrice) {
        filter.price = {};
        if (filters.minPrice) filter.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) filter.price.$lte = parseFloat(filters.maxPrice);
      }
      if (filters.inStock === 'true') filter.stockQuantity = { $gt: 0 };
      if (filters.isPrescriptionRequired) filter.isPrescriptionRequired = filters.isPrescriptionRequired === 'true';
    }

    const results = await this.medicineModel
      .find(filter)
      .sort({ totalSold: -1, averageRating: -1 })
      .limit(50)
      .exec();

    if (query.trim().length >= 2) {
      this.addToTrending(query.trim());
    }

    return {
      message: 'Search results',
      data: results,
      meta: { total: results.length, query },
    };
  }

  async autocomplete(query: string) {
    if (!query || query.trim().length < 2) {
      return { message: 'Autocomplete suggestions', data: [] };
    }

    const searchRegex = new RegExp(`^${query.trim()}`, 'i');

    const results = await this.medicineModel
      .find({
        deletedAt: null,
        isActive: true,
        $or: [
          { name: searchRegex },
          { nameAr: searchRegex },
          { activeIngredient: searchRegex },
        ],
      })
      .select('name nameAr activeIngredient sku')
      .limit(10)
      .exec();

    const suggestions = results.map((r) => ({
      id: r._id,
      text: r.name,
      textAr: r.nameAr,
      sku: r.sku,
    }));

    return {
      message: 'Autocomplete suggestions',
      data: suggestions,
    };
  }

  async getTrendingSearches() {
    return {
      message: 'Trending searches',
      data: this.trendingSearches.slice(0, 10),
    };
  }

  async getSearchSuggestions(query: string) {
    if (!query || query.trim().length < 2) {
      return { message: 'Search suggestions', data: [] };
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const [medicines, tags] = await Promise.all([
      this.medicineModel
        .find({ deletedAt: null, isActive: true, name: searchRegex })
        .select('name')
        .limit(5)
        .exec(),
      this.medicineModel
        .distinct('tags', { deletedAt: null, isActive: true, tags: searchRegex })
        .exec(),
    ]);

    return {
      message: 'Search suggestions',
      data: {
        medicines: medicines.map((m) => m.name),
        tags: tags.slice(0, 5),
      },
    };
  }

  private addToTrending(query: string) {
    const index = this.trendingSearches.indexOf(query);
    if (index > -1) {
      this.trendingSearches.splice(index, 1);
    }
    this.trendingSearches.unshift(query);
    if (this.trendingSearches.length > 50) {
      this.trendingSearches = this.trendingSearches.slice(0, 50);
    }
  }
}
