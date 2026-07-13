import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../shared/widgets/empty_state.dart';

class AddressesPage extends ConsumerStatefulWidget {
  const AddressesPage({super.key});

  @override
  ConsumerState<AddressesPage> createState() => _AddressesPageState();
}

class _AddressesPageState extends ConsumerState<AddressesPage> {
  final List<Map<String, dynamic>> _addresses = [
    {
      'id': '1',
      'title': 'Home',
      'address': '123 Main Street, Nasr City',
      'city': 'Cairo',
      'isDefault': true,
    },
    {
      'id': '2',
      'title': 'Office',
      'address': '456 Business Avenue, Down Town',
      'city': 'Cairo',
      'isDefault': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Addresses')),
      body: _addresses.isEmpty
          ? const EmptyState(
              title: 'No saved addresses',
              subtitle: 'Add your delivery addresses',
              buttonText: 'Add Address',
            )
          : ListView.builder(
              padding: EdgeInsets.all(16.r),
              itemCount: _addresses.length,
              itemBuilder: (context, index) {
                final addr = _addresses[index];
                return Card(
                  margin: EdgeInsets.only(bottom: 8.h),
                  child: Padding(
                    padding: EdgeInsets.all(16.r),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              addr['isDefault']
                                  ? Icons.home
                                  : Icons.location_on_outlined,
                              color: theme.colorScheme.primary,
                            ),
                            SizedBox(width: 8.w),
                            Text(
                              addr['title'],
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (addr['isDefault']) ...[
                              SizedBox(width: 8.w),
                              Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 6.w,
                                  vertical: 2.h,
                                ),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primaryContainer,
                                  borderRadius: BorderRadius.circular(4.r),
                                ),
                                child: Text(
                                  'Default',
                                  style: TextStyle(
                                    fontSize: 10.sp,
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        SizedBox(height: 8.h),
                        Text(addr['address']),
                        Text('${addr['city']}, Egypt'),
                        SizedBox(height: 12.h),
                        Row(
                          children: [
                            TextButton(
                              onPressed: () {},
                              child: const Text('Edit'),
                            ),
                            TextButton(
                              onPressed: () {},
                              child: Text(
                                'Delete',
                                style: TextStyle(
                                  color: theme.colorScheme.error,
                                ),
                              ),
                            ),
                            if (!addr['isDefault'])
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    for (var a in _addresses) {
                                      a['isDefault'] = false;
                                    }
                                    addr['isDefault'] = true;
                                  });
                                },
                                child: const Text('Set Default'),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddAddressDialog,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddAddressDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.all(16.r),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Add Address', style: Theme.of(context).textTheme.titleLarge),
            SizedBox(height: 16.h),
            TextField(
              decoration: InputDecoration(
                labelText: 'Title',
                hintText: 'e.g., Home, Office',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
            ),
            SizedBox(height: 12.h),
            TextField(
              decoration: InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
            ),
            SizedBox(height: 12.h),
            TextField(
              decoration: InputDecoration(
                labelText: 'City',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
            ),
            SizedBox(height: 16.h),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Address added!')),
                  );
                },
                child: const Text('Save Address'),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).viewInsets.bottom),
          ],
        ),
      ),
    );
  }
}
