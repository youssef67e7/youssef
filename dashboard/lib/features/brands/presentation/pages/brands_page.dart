import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final brandsProvider = FutureProvider<List<Brand>>((ref) async {
  return List.generate(
    12,
    (i) => Brand(
      id: 'BRAND-${i + 1}',
      name: ['PharmaCo', 'MedLife', 'HealthPlus', 'BioGen', 'GlobalPharm',
          'NatureMed', 'VitaHealth', 'CureAll', 'MedSource', 'PharmaTech',
          'WellnessCo', 'LifeScience'][i],
      description: 'Brand description',
      isActive: i != 8,
      productCount: [45, 38, 52, 30, 25, 42, 35, 28, 15, 20, 33, 40][i],
      createdAt: DateTime.now().subtract(Duration(days: 365 - i * 25)),
    ),
  );
});

class BrandsPage extends ConsumerWidget {
  const BrandsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brandsAsync = ref.watch(brandsProvider);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Brands',
            subtitle: 'Manage medicine brands',
            actions: [
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Brand'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          brandsAsync.when(
            data: (brands) => Card(
              child: DataTable(
                columns: const [
                  DataColumn(label: Text('Brand')),
                  DataColumn(label: Text('Products'), numeric: true),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Actions')),
                ],
                rows: brands
                    .map(
                      (brand) => DataRow(cells: [
                        DataCell(
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.branding_watermark, size: 20, color: Colors.blue),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(brand.name, style: const TextStyle(fontWeight: FontWeight.w500)),
                                  Text(
                                    brand.description ?? '',
                                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        DataCell(Text(brand.productCount.toString())),
                        DataCell(
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: (brand.isActive ? Colors.green : Colors.red).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              brand.isActive ? 'Active' : 'Inactive',
                              style: TextStyle(
                                fontSize: 12,
                                color: brand.isActive ? Colors.green : Colors.red,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                        DataCell(
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(icon: const Icon(Icons.edit_outlined, size: 18), onPressed: () {}),
                              IconButton(
                                icon: Icon(Icons.delete_outline, size: 18, color: Colors.red.shade400),
                                onPressed: () {},
                              ),
                            ],
                          ),
                        ),
                      ]),
                    )
                    .toList(),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }
}
