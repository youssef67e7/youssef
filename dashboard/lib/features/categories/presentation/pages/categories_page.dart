import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  return List.generate(
    15,
    (i) => Category(
      id: 'CAT-${i + 1}',
      name: ['Pain Relief', 'Antibiotics', 'Vitamins & Supplements', 'Allergy',
          'Gastrointestinal', 'Cardiovascular', 'Respiratory', 'Dermatology',
          'Diabetes', 'Eye Care', 'Oral Care', 'Baby Care', 'First Aid',
          'Herbal', 'Personal Care'][i],
      nameAr: ['مسكنات', 'مضادات حيوية', 'فيتامينات', 'حساسية',
          'جهاز هضمي', ' Cardiovascular', 'تنفسي', 'جلدية',
          'سكري', 'رعاية العيون', 'عناية فموية', 'رعاية الأطفال',
          'إسعافات أولية', 'أعشاب', 'عناية شخصية'][i],
      description: 'Category description',
      productCount: [120, 85, 95, 45, 60, 40, 35, 50, 30, 25, 20, 45, 55, 70, 80][i],
      isActive: i != 10,
      sortOrder: i,
      createdAt: DateTime.now().subtract(Duration(days: 365 - i * 20)),
    ),
  );
});

class CategoriesPage extends ConsumerWidget {
  const CategoriesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Categories',
            subtitle: 'Manage medicine categories',
            actions: [
              ElevatedButton.icon(
                onPressed: () => _showAddCategoryDialog(context, ref),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Category'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          categoriesAsync.when(
            data: (categories) => Card(
              child: DataTable(
                columns: const [
                  DataColumn(label: Text('Name')),
                  DataColumn(label: Text('Name (Arabic)')),
                  DataColumn(label: Text('Products'), numeric: true),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Sort Order'), numeric: true),
                  DataColumn(label: Text('Actions')),
                ],
                rows: categories
                    .map(
                      (cat) => DataRow(cells: [
                        DataCell(Text(cat.name, style: const TextStyle(fontWeight: FontWeight.w500))),
                        DataCell(Text(cat.nameAr)),
                        DataCell(Text(cat.productCount.toString())),
                        DataCell(
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: (cat.isActive ? Colors.green : Colors.red).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              cat.isActive ? 'Active' : 'Inactive',
                              style: TextStyle(
                                fontSize: 12,
                                color: cat.isActive ? Colors.green : Colors.red,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                        DataCell(Text(cat.sortOrder.toString())),
                        DataCell(
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, size: 18),
                                onPressed: () {},
                              ),
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

  void _showAddCategoryDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Category'),
        content: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const TextFormField(decoration: InputDecoration(labelText: 'Name (English)')),
                const SizedBox(height: 12),
                const TextFormField(decoration: InputDecoration(labelText: 'Name (Arabic)')),
                const SizedBox(height: 12),
                const TextFormField(decoration: InputDecoration(labelText: 'Description')),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Parent Category'),
                  items: const [
                    DropdownMenuItem(value: null, child: Text('None (Root)')),
                    DropdownMenuItem(value: '1', child: Text('Pain Relief')),
                    DropdownMenuItem(value: '2', child: Text('Antibiotics')),
                  ],
                  onChanged: (v) {},
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Category added successfully')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
