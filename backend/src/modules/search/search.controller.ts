import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search medicines' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'dosageForm', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'inStock', required: false })
  async search(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('dosageForm') dosageForm?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
  ) {
    return this.searchService.search(query, { category, brand, dosageForm, minPrice, maxPrice, inStock });
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete search' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async autocomplete(@Query('q') query: string) {
    return this.searchService.autocomplete(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending searches' })
  async getTrending() {
    return this.searchService.getTrendingSearches();
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async getSuggestions(@Query('q') query: string) {
    return this.searchService.getSearchSuggestions(query);
  }
}
