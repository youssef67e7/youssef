import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';

final driversProvider = FutureProvider<List<Driver>>((ref) async {
  return List.generate(
    10,
    (i) => Driver(
      id: 'DRV-${i + 1}',
      name: ['Mohammed Driver', 'Salem Driver', 'Ali Driver', 'Omar Driver', 'Hassan Driver',
          'Khalid Driver', 'Yusuf Driver', 'Tariq Driver', 'Faisal Driver', 'Sami Driver'][i],
      email: 'driver${i + 1}@example.com',
      phone: '+9665${(50000000 + i * 1111111).toString().substring(0, 8)}',
      vehicleType: ['Car', 'Motorcycle', 'Car', 'Motorcycle', 'Car', 'Bicycle', 'Motorcycle', 'Car', 'Car', 'Motorcycle'][i],
      vehicleNumber: 'ABC-${1000 + i}',
      isOnline: i < 6,
      isActive: i != 4,
      totalDeliveries: [450, 380, 520, 300, 250, 420, 350, 280, 150, 200][i],
      totalEarnings: [12500, 10800, 15200, 8500, 7200, 11500, 9800, 7600, 4500, 5800][i].toDouble(),
      rating: 4.0 + (i % 5) * 0.2,
      createdAt: DateTime.now().subtract(Duration(days: 365 - i * 30)),
    ),
  );
});

final driverSearchProvider = StateProvider<String>((ref) => '');

class DriversPage extends ConsumerWidget {
  const DriversPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final driversAsync = ref.watch(driversProvider);
    final searchQuery = ref.watch(driverSearchProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Drivers',
            subtitle: 'Manage delivery drivers',
            actions: [
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Driver'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search drivers...',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  filled: true,
                  fillColor: isDark ? Colors.white10 : Colors.grey.shade100,
                ),
                onChanged: (v) => ref.read(driverSearchProvider.notifier).state = v,
              ),
            ),
          ),
          const SizedBox(height: 16),
          driversAsync.when(
            data: (allDrivers) {
              var filtered = allDrivers;
              if (searchQuery.isNotEmpty) {
                filtered = filtered.where((d) =>
                    d.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
                    d.phone.contains(searchQuery)).toList();
              }

              return Card(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SizedBox(
                    width: 1000,
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Driver')),
                        DataColumn(label: Text('Vehicle')),
                        DataColumn(label: Text('Status')),
                        DataColumn(label: Text('Deliveries'), numeric: true),
                        DataColumn(label: Text('Earnings'), numeric: true),
                        DataColumn(label: Text('Rating'), numeric: true),
                        DataColumn(label: Text('Actions')),
                      ],
                      rows: filtered
                          .map(
                            (driver) => DataRow(cells: [
                              DataCell(
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Stack(
                                      children: [
                                        CircleAvatar(
                                          radius: 16,
                                          backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                          child: Text(driver.initials, style: TextStyle(
                                            fontSize: 12, color: Theme.of(context).colorScheme.primary,
                                          )),
                                        ),
                                        Positioned(
                                          right: 0,
                                          bottom: 0,
                                          child: Container(
                                            width: 10,
                                            height: 10,
                                            decoration: BoxDecoration(
                                              color: driver.isOnline ? Colors.green : Colors.grey,
                                              shape: BoxShape.circle,
                                              border: Border.all(color: Theme.of(context).cardColor, width: 2),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(driver.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                                        Text(driver.phone, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              DataCell(Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(driver.vehicleType ?? '-'),
                                  Text(driver.vehicleNumber ?? '-',
                                      style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                                ],
                              )),
                              DataCell(
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: (driver.isOnline ? Colors.green : Colors.grey).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    driver.isOnline ? 'Online' : 'Offline',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: driver.isOnline ? Colors.green : Colors.grey,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ),
                              DataCell(Text(driver.totalDeliveries.toString())),
                              DataCell(Text(Formatters.formatCurrency(driver.totalEarnings))),
                              DataCell(
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.star, size: 14, color: Colors.amber),
                                    const SizedBox(width: 4),
                                    Text(driver.rating.toStringAsFixed(1)),
                                  ],
                                ),
                              ),
                              DataCell(
                                PopupMenuButton<String>(
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(value: 'view', child: Text('View Details')),
                                    const PopupMenuItem(value: 'earnings', child: Text('View Earnings')),
                                    const PopupMenuItem(value: 'deliveries', child: Text('Delivery History')),
                                    const PopupMenuItem(value: 'edit', child: Text('Edit')),
                                  ],
                                  onSelected: (v) {},
                                ),
                              ),
                            ]),
                          )
                          .toList(),
                    ),
                  ),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }
}
