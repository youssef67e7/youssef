import 'dart:io';
import 'package:pharmaworld_driver/features/deliveries/service/delivery_service.dart';
import 'package:pharmaworld_driver/shared/models/delivery.dart';

class DeliveryRepository {
  final DeliveryService _deliveryService;

  DeliveryRepository({required DeliveryService deliveryService})
      : _deliveryService = deliveryService;

  Future<Delivery?> getActiveDelivery() async {
    final response = await _deliveryService.getActiveDelivery();
    if (response['delivery'] != null) {
      return Delivery.fromJson(response['delivery']);
    }
    return null;
  }

  Future<List<Delivery>> getDeliveryQueue() async {
    final response = await _deliveryService.getDeliveryQueue();
    final deliveries = response['deliveries'] as List? ?? [];
    return deliveries.map((d) => Delivery.fromJson(d)).toList();
  }

  Future<List<Delivery>> getCompletedDeliveries({int page = 1}) async {
    final response = await _deliveryService.getCompletedDeliveries(page: page);
    final deliveries = response['deliveries'] as List? ?? [];
    return deliveries.map((d) => Delivery.fromJson(d)).toList();
  }

  Future<Delivery> getDeliveryDetail(String id) async {
    final response = await _deliveryService.getDeliveryDetail(id);
    return Delivery.fromJson(response['delivery']);
  }

  Future<void> acceptDelivery(String deliveryId) async {
    await _deliveryService.acceptDelivery(deliveryId);
  }

  Future<void> declineDelivery(String deliveryId) async {
    await _deliveryService.declineDelivery(deliveryId);
  }

  Future<void> updateStatus(String deliveryId, String status) async {
    await _deliveryService.updateStatus(deliveryId, status);
  }

  Future<void> confirmDelivery(String deliveryId, {String? photoUrl, String? signatureUrl}) async {
    await _deliveryService.confirmDelivery(deliveryId, photoUrl: photoUrl, signatureUrl: signatureUrl);
  }

  Future<void> failDelivery(String deliveryId, String reason) async {
    await _deliveryService.failDelivery(deliveryId, reason);
  }

  Future<String> uploadPhoto(File file) async {
    final response = await _deliveryService.uploadPhoto(file);
    return response['url'] ?? '';
  }
}
