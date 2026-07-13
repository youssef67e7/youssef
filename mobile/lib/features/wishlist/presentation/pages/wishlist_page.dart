import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/medicine_card.dart';
import '../../../../shared/widgets/empty_state.dart';

class WishlistPage extends ConsumerStatefulWidget {
  const WishlistPage({super.key});

  @override
  ConsumerState<WishlistPage> createState() => _WishlistPageState();
}

class _WishlistPageState extends ConsumerState<WishlistPage> {
  final List<Map<String, dynamic>> _wishlistItems = [
    {'id': '1', 'name': 'Panadol Extra', 'price': 45.0, 'image': 'https://via.placeholder.com/200'},
    {'id': '2', 'name': 'Vitamin C', 'price': 85.0, 'image': 'https://via.placeholder.com/200'},
    {'id': '3', 'name': 'Omega-3', 'price': 180.0, 'image': 'https://via.placeholder.com/200'},
  ];

  @override
  Widget build(BuildContext context) {
    if (_wishlistItems.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Wishlist')),
        body: const EmptyState(
          type: EmptyStateType.emptyWishlist,
          title: 'Your wishlist is empty',
          subtitle: 'Save items you love for later',
          buttonText: 'Explore Medicines',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Wishlist (${_wishlistItems.length})'),
      ),
      body: GridView.builder(
        padding: EdgeInsets.all(16.r),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.7,
          crossAxisSpacing: 12.w,
          mainAxisSpacing: 12.h,
        ),
        itemCount: _wishlistItems.length,
        itemBuilder: (context, index) {
          final item = _wishlistItems[index];
          return MedicineCard(
            id: item['id'],
            name: item['name'],
            imageUrl: item['image'],
            price: item['price'],
            isWishlisted: true,
            onTap: () {},
            onAddToCart: () {},
            onToggleWishlist: () {
              setState(() {
                _wishlistItems.removeAt(index);
              });
            },
          );
        },
      ),
    );
  }
}
