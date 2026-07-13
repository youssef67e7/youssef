import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/providers/auth_provider.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/shared/models/order_model.dart';

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getDashboardStats();
  final data = response.data['data'];
  if (data is Map<String, dynamic>) {
    return DashboardStats.fromJson(data);
  }
  return DashboardStats();
});

final revenueChartProvider = FutureProvider<List<ChartData>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getDashboardRevenue();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => ChartData.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final ordersChartProvider = FutureProvider<List<ChartData>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getDashboardOrders();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => ChartData.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final topMedicinesProvider = FutureProvider<List<ChartData>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getTopMedicines();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => ChartData.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final recentOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getOrders();
  final data = response.data['data'];
  if (data is List) {
    final orders = data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    return orders.take(8).toList();
  }
  return [];
});

final orderStatusProvider = FutureProvider<List<ChartData>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getDashboardOrders();
  final data = response.data['data'];
  if (data is List) {
    return data.map((e) => ChartData.fromJson(e as Map<String, dynamic>)).toList();
  }
  return [];
});

final inventoryAlertsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiServiceProvider);
  final response = await api.getInventoryAlerts();
  final data = response.data['data'];
  if (data is Map<String, dynamic>) {
    return data;
  }
  return {};
});
