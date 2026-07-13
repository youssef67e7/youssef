import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'package:pharmaworld/core/constants/app_strings.dart';
import 'package:pharmaworld/core/router/route_names.dart';
import 'package:pharmaworld/shared/widgets/banner_carousel.dart';
import 'package:pharmaworld/shared/widgets/category_card.dart';
import 'package:pharmaworld/shared/widgets/medicine_card.dart';
import 'package:pharmaworld/shared/widgets/search_bar.dart';
import 'package:pharmaworld/features/home/presentation/providers/home_provider.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final homeData = ref.watch(homeDataProvider);
    final banners = ref.watch(bannersProvider);
    final categories = ref.watch(categoriesProvider);
    final featuredMedicines = ref.watch(featuredMedicinesProvider);
    final specialOffers = ref.watch(specialOffersProvider);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            snap: true,
            title: Row(
              children: [
                Icon(Icons.local_pharmacy, color: theme.colorScheme.primary),
                SizedBox(width: 8.w),
                Text(
                  'PharmaWorld',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18.sp,
                  ),
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.push(RouteNames.notifications),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(16.r),
              child: CustomSearchBar(
                hintText: AppStrings.searchMedicines,
                onTap: () => context.push(RouteNames.medicineSearch),
                readOnly: true,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: banners.when(
              data: (bannerList) => BannerCarousel(
                banners: bannerList
                    .map((b) => BannerItem(
                          title: b.title ?? '',
                          subtitle: b.subtitle,
                          imageUrl: b.imageUrl,
                          color: theme.colorScheme.primary,
                          icon: Icons.local_offer,
                        ))
                    .toList(),
                onTap: (index) {},
              ),
              loading: () => const SizedBox(
                height: 180,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => const SizedBox.shrink(),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(height: 24.h),
          ),
          SliverToBoxAdapter(
            child: _buildSectionHeader(
              context,
              title: AppStrings.popularCategories,
              onViewAll: () => context.push(RouteNames.categories),
            ),
          ),
          SliverToBoxAdapter(
            child: categories.when(
              data: (categoryList) => SizedBox(
                height: 110.h,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  itemCount: categoryList.length,
                  separatorBuilder: (_, __) => SizedBox(width: 12.w),
                  itemBuilder: (context, index) {
                    final cat = categoryList[index];
                    return SizedBox(
                      width: 90.w,
                      child: CategoryCard(
                        name: cat.name ?? '',
                        onTap: () => context.push(
                          RouteNames.categoryDetailPath(cat.id ?? ''),
                        ),
                      ),
                    );
                  },
                ),
              ),
              loading: () => SizedBox(
                height: 110.h,
                child: const Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => const SizedBox.shrink(),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(height: 24.h),
          ),
          SliverToBoxAdapter(
            child: _buildSectionHeader(
              context,
              title: AppStrings.featuredMedicines,
              onViewAll: () {},
            ),
          ),
          featuredMedicines.when(
            data: (medicineList) => SliverPadding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              sliver: SliverGrid(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.7,
                  crossAxisSpacing: 12.w,
                  mainAxisSpacing: 12.h,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final med = medicineList[index];
                    return MedicineCard(
                      id: med.id ?? '$index',
                      name: med.name ?? '',
                      imageUrl: med.imageUrl ?? '',
                      price: med.price ?? 0,
                      originalPrice: med.originalPrice,
                      rating: med.rating,
                      reviewCount: med.reviewCount,
                      onTap: () => context.push(
                        RouteNames.medicineDetailPath(med.id ?? ''),
                      ),
                      onAddToCart: () {},
                      onToggleWishlist: () {},
                    );
                  },
                  childCount: medicineList.length,
                ),
              ),
            ),
            loading: () => const SliverToBoxAdapter(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => const SliverToBoxAdapter(
              child: Center(child: Text('Failed to load medicines')),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(height: 24.h),
          ),
          SliverToBoxAdapter(
            child: _buildSectionHeader(
              context,
              title: AppStrings.specialOffers,
              onViewAll: () {},
            ),
          ),
          specialOffers.when(
            data: (offerList) => SliverPadding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              sliver: SliverGrid(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.7,
                  crossAxisSpacing: 12.w,
                  mainAxisSpacing: 12.h,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final offer = offerList[index];
                    return MedicineCard(
                      id: 'offer_${offer.id ?? index}',
                      name: offer.name ?? '',
                      imageUrl: offer.imageUrl ?? '',
                      price: offer.price ?? 0,
                      originalPrice: offer.originalPrice,
                      rating: offer.rating,
                      reviewCount: offer.reviewCount,
                      onTap: () => context.push(
                        RouteNames.medicineDetailPath(offer.id ?? ''),
                      ),
                      onAddToCart: () {},
                      onToggleWishlist: () {},
                    );
                  },
                  childCount: offerList.length,
                ),
              ),
            ),
            loading: const SliverToBoxAdapter(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => const SliverToBoxAdapter(
              child: Center(child: Text('Failed to load offers')),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(height: 32.h),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context, {
    required String title,
    VoidCallback? onViewAll,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          if (onViewAll != null)
            TextButton(
              onPressed: onViewAll,
              child: const Text(AppStrings.viewAll),
            ),
        ],
      ),
    );
  }
}
