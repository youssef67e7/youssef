import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/cart_models.dart';

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

class CartState {
  final List<CartItemModel> items;
  final String? couponCode;
  final double? couponDiscount;

  const CartState({
    this.items = const [],
    this.couponCode,
    this.couponDiscount,
  });

  double get subtotal =>
      items.fold(0, (sum, item) => sum + item.price * item.quantity);
  double get deliveryFee => subtotal > 200 ? 0 : 25;
  double get tax => (subtotal - (couponDiscount ?? 0)) * 0.14;
  double get total => subtotal - (couponDiscount ?? 0) + deliveryFee + tax;
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  bool get isEmpty => items.isEmpty;

  CartState copyWith({
    List<CartItemModel>? items,
    String? couponCode,
    double? couponDiscount,
  }) {
    return CartState(
      items: items ?? this.items,
      couponCode: couponCode ?? this.couponCode,
      couponDiscount: couponDiscount ?? this.couponDiscount,
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  void addItem(CartItemModel item) {
    final existingIndex = state.items.indexWhere(
      (i) => i.medicineId == item.medicineId,
    );

    if (existingIndex >= 0) {
      final updatedItems = List<CartItemModel>.from(state.items);
      final existing = updatedItems[existingIndex];
      updatedItems[existingIndex] = existing.copyWith(
        quantity: existing.quantity + item.quantity,
      );
      state = state.copyWith(items: updatedItems);
    } else {
      state = state.copyWith(items: [...state.items, item]);
    }
  }

  void removeItem(String itemId) {
    state = state.copyWith(
      items: state.items.where((item) => item.id != itemId).toList(),
    );
  }

  void updateQuantity(String itemId, int quantity) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    final updatedItems = state.items.map((item) {
      if (item.id == itemId) {
        return item.copyWith(quantity: quantity);
      }
      return item;
    }).toList();

    state = state.copyWith(items: updatedItems);
  }

  void applyCoupon(String code, double discount) {
    state = state.copyWith(
      couponCode: code,
      couponDiscount: discount,
    );
  }

  void removeCoupon() {
    state = state.copyWith(
      couponCode: null,
      couponDiscount: null,
    );
  }

  void clear() {
    state = const CartState();
  }
}
