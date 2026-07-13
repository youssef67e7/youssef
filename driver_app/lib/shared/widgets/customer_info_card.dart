import 'package:flutter/material.dart';
import 'package:pharmaworld_driver/core/constants/app_colors.dart';
import 'package:url_launcher/url_launcher.dart';

class CustomerInfoCard extends StatelessWidget {
  final String name;
  final String phone;
  final String? email;
  final String? image;

  const CustomerInfoCard({
    super.key,
    required this.name,
    required this.phone,
    this.email,
    this.image,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Customer',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                backgroundColor: AppColors.primaryLight,
                child: image != null
                    ? ClipOval(
                        child: Image.network(
                          image!,
                          width: 40,
                          height: 40,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Text(
                            name[0].toUpperCase(),
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      )
                    : Text(
                        name[0].toUpperCase(),
                        style: const TextStyle(color: Colors.white),
                      ),
              ),
              title: Text(name),
              subtitle: Text(phone),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    onPressed: () => _makePhoneCall(phone),
                    icon: const Icon(Icons.call, color: AppColors.success),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final url = Uri.parse('tel:$phoneNumber');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }
}
