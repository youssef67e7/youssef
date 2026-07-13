import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/router/route_names.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/widgets/banner_carousel.dart';
import '../../../shared/widgets/category_card.dart';
import '../../../shared/widgets/medicine_card.dart';
import '../../../shared/widgets/search_bar.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
                onPressed: () {},
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(16.r),
              child: CustomSearchBar(
                hintText: AppStrings.searchMedicines,
                onTap: () => context.push('/medicines/search'),
                readOnly: true,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: BannerCarousel(
              banners: const [
                BannerItem(
                  title: 'Up to 30% Off',
                  subtitle: 'On all medicines this week',
                  icon: Icons.local_offer,
                  color: Color(0xFF00897B),
                ),
                BannerItem(
                  title: 'Free Delivery',
                  subtitle: 'On orders over E£200',
                  icon: Icons.local_shipping,
                  color: Color(0xFF1E88E5),
                ),
                BannerItem(
                  title: 'Health Check',
                  subtitle: 'Book your health checkup today',
                  icon: Icons.health_and_safety,
                  color: Color(0xFFE53935),
                ),
              ],
              onTap: (index) {},
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
            child: SizedBox(
              height: 110.h,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                itemCount: _categories.length,
                separatorBuilder: (_, __) => SizedBox(width: 12.w),
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  return SizedBox(
                    width: 90.w,
                    child: CategoryCard(
                      name: cat['name']!,
                      onTap: () {},
                    ),
                  );
                },
              ),
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
          SliverPadding(
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
                  return MedicineCard(
                    id: '$index',
                    name: _medicines[index]['name']!,
                    imageUrl: _medicines[index]['image']!,
                    price: double.parse(_medicines[index]['price']!),
                    originalPrice: _medicines[index]['originalPrice'] != null
                        ? double.parse(_medicines[index]['originalPrice']!)
                        : null,
                    rating: 4.0 + (index % 3) * 0.3,
                    reviewCount: 10 + index * 5,
                    onTap: () {},
                    onAddToCart: () {},
                    onToggleWishlist: () {},
                  );
                },
                childCount: _medicines.length,
              ),
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
          SliverPadding(
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
                  return MedicineCard(
                    id: 'offer_$index',
                    name: _offers[index]['name']!,
                    imageUrl: _offers[index]['image']!,
                    price: double.parse(_offers[index]['price']!),
                    originalPrice: double.parse(_offers[index]['originalPrice']!),
                    onTap: () {},
                    onAddToCart: () {},
                    onToggleWishlist: () {},
                  );
                },
                childCount: _offers.length,
              ),
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

  static final List<Map<String, String>> _categories = [
    {'name': 'Pain Relief', 'icon': '💊'},
    {'name': 'Vitamins', 'icon': '🧪'},
    {'name': 'Antibiotics', 'icon': '💉'},
    {'name': 'Skincare', 'icon': '🧴'},
    {'name': 'Heart', 'icon': '❤️'},
    {'name': 'Diabetes', 'icon': '🩸'},
  ];

  static final List<Map<String, String>> _medicines = [
    {'name': 'Panadol Extra', 'price': '45.00', 'image': 'https://via.placeholder.com/200'},
    {'name': 'Augmentin 1g', 'price': '120.00', 'image': 'https://via.placeholder.com/200'},
    {'name': 'Ventolin Inhaler', 'price': '85.00', 'image': 'https://via.placeholder.com/200'},
    {'name': 'Voltaren Gel', 'price': '65.00', 'image': 'https://via.placeholder.com/200'},
  ];

  static final List<Map<String, String>> _offers = [
    {
      'name': 'Centrum Multivitamin',
      'price': '150.00',
      'originalPrice': '200.00',
      'image': 'https://via.placeholder.com/200'
    },
    {
      'name': 'Omega-3 Fish Oil',
      'price': '180.00',
      'originalPrice': '250.00',
      'image': 'https://via.placeholder.com/200'
    },
  ];
}
