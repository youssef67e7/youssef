import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pharmaworld_dashboard/shared/widgets/page_header.dart';
import 'package:pharmaworld_dashboard/shared/widgets/status_badge.dart';
import 'package:pharmaworld_dashboard/shared/widgets/bulk_action_bar.dart';
import 'package:pharmaworld_dashboard/shared/widgets/export_button.dart';
import 'package:pharmaworld_dashboard/shared/widgets/import_button.dart';
import 'package:pharmaworld_dashboard/shared/models/models.dart';
import 'package:pharmaworld_dashboard/core/utils/formatters.dart';
import 'package:pharmaworld_dashboard/core/utils/validators.dart';

final medicinesProvider = FutureProvider<List<Medicine>>((ref) async {
  return List.generate(
    25,
    (i) => Medicine(
      id: 'MED-${i + 1}',
      name: ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Amoxicillin 250mg', 'Vitamin C 1000mg',
          'Cetirizine 10mg', 'Omeprazole 20mg', 'Metformin 500mg', 'Losartan 50mg',
          'Amlodipine 5mg', 'Atorvastatin 20mg', 'Omeprazole 40mg', 'Azithromycin 250mg',
          'Dexamethasone 4mg', 'Prednisone 5mg', 'Metoprolol 50mg', 'Gabapentin 300mg',
          'Pantoprazole 40mg', 'Montelukast 10mg', 'Salbutamol Inhaler', 'Insulin Glargine',
          'Warfarin 5mg', 'Clopidogrel 75mg', 'Levothyroxine 50mcg', 'Hydrochlorothiazide 25mg',
          'Diazepam 5mg'][i],
      nameAr: ['باراسيتامول', 'إيبوبروفين', 'أموكسيسيلين', 'فيتامين سي',
          'سيتريزين', 'أوميبرازول', 'متفورمين', 'لوزارتان',
          'أملوديبين', 'أتورفاستاتين', 'أوميبرازول', 'أزيثروميسين',
          'ديكساميثازون', 'بريدنيزون', 'ميتوبرولول', 'جابابنتين',
          'بانتوبرازول', 'مونتيلوكاست', 'سالبيوتامول', 'إنسولين',
          'وارفارين', 'كلبيدوجريل', 'ليفوثيروكسين', 'هيدروكلوروثيازيد',
          'ديازيبام'][i],
      price: [5.99, 7.99, 12.50, 15.99, 8.50, 22.00, 18.75, 25.00,
          14.50, 35.00, 28.00, 32.00, 10.50, 12.00, 16.50, 45.00,
          30.00, 20.00, 25.50, 85.00, 40.00, 28.50, 15.00, 12.50, 8.00][i],
      stock: [100, 50, 200, 150, 80, 30, 120, 45, 90, 60, 35, 75, 25, 110, 55, 40, 65, 85, 30, 20, 45, 70, 95, 120, 15][i],
      categoryId: 'CAT-${(i % 5) + 1}',
      categoryName: ['Pain Relief', 'Antibiotics', 'Vitamins', 'Allergy', 'Gastrointestinal'][i % 5],
      brandId: 'BRAND-${(i % 4) + 1}',
      brandName: ['PharmaCo', 'MedLife', 'HealthPlus', 'BioGen'][i % 4],
      manufacturer: ['PharmaCo', 'MedLife', 'HealthPlus', 'BioGen', 'GlobalPharm'][i % 5],
      sku: 'SKU-${(i + 1).toString().padLeft(4, '0')}',
      isActive: i != 5 && i != 12,
      isFeatured: i < 5,
      rating: 3.5 + (i % 4) * 0.3,
      soldCount: [245, 198, 165, 142, 128, 115, 98, 85, 78, 72, 65, 60, 55, 50, 48, 42, 38, 35, 32, 28, 25, 22, 20, 18, 15][i],
      createdAt: DateTime.now().subtract(Duration(days: 365 - i * 10)),
      updatedAt: DateTime.now().subtract(Duration(days: i)),
    ),
  );
});

final medicineSearchProvider = StateProvider<String>((ref) => '');
final medicineCategoryFilterProvider = StateProvider<String>((ref) => '');
final medicinePageProvider = StateProvider<int>((ref) => 1);
final selectedMedicinesProvider = StateProvider<Set<String>>((ref) => {});

class MedicinesPage extends ConsumerWidget {
  const MedicinesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medicinesAsync = ref.watch(medicinesProvider);
    final searchQuery = ref.watch(medicineSearchProvider);
    final selectedCategory = ref.watch(medicineCategoryFilterProvider);
    final currentPage = ref.watch(medicinePageProvider);
    final selectedIds = ref.watch(selectedMedicinesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    const pageSize = 10;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Medicines',
            subtitle: 'Manage your medicine inventory',
            actions: [
              ImportButton(
                onImport: (data) async {},
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () => _showAddMedicineDialog(context, ref),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Medicine'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildFilters(context, ref),
          const SizedBox(height: 16),
          BulkActionBar(
            selectedCount: selectedIds.length,
            onDelete: () {},
            onActivate: () {},
            onDeactivate: () {},
            onClearSelection: () {
              ref.read(selectedMedicinesProvider.notifier).state = {};
            },
          ),
          if (selectedIds.isNotEmpty) const SizedBox(height: 8),
          medicinesAsync.when(
            data: (allMedicines) {
              var filtered = allMedicines;
              if (searchQuery.isNotEmpty) {
                filtered = filtered
                    .where((m) =>
                        m.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
                        m.sku?.toLowerCase().contains(searchQuery.toLowerCase()) == true)
                    .toList();
              }
              if (selectedCategory.isNotEmpty) {
                filtered = filtered
                    .where((m) => m.categoryName == selectedCategory)
                    .toList();
              }

              final totalPages = (filtered.length / pageSize).ceil();
              final paged = filtered
                  .skip((currentPage - 1) * pageSize)
                  .take(pageSize)
                  .toList();

              return Card(
                child: Column(
                  children: [
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: SizedBox(
                        width: 1100,
                        child: DataTable(
                          headingRowColor: WidgetStateProperty.all(
                            isDark ? Colors.white10 : Colors.grey.shade50,
                          ),
                          columns: [
                            DataColumn(
                              label: Checkbox(
                                value: paged.isNotEmpty &&
                                    paged.every((m) => selectedIds.contains(m.id)),
                                onChanged: (value) {
                                  final newIds = Set<String>.from(selectedIds);
                                  if (value == true) {
                                    newIds.addAll(paged.map((m) => m.id));
                                  } else {
                                    for (final m in paged) {
                                      newIds.remove(m.id);
                                    }
                                  }
                                  ref.read(selectedMedicinesProvider.notifier).state = newIds;
                                },
                              ),
                            ),
                            const DataColumn(label: Text('Medicine')),
                            const DataColumn(label: Text('SKU')),
                            const DataColumn(label: Text('Category')),
                            const DataColumn(label: Text('Brand')),
                            const DataColumn(label: Text('Price'), numeric: true),
                            const DataColumn(label: Text('Stock'), numeric: true),
                            const DataColumn(label: Text('Status')),
                            const DataColumn(label: Text('Actions')),
                          ],
                          rows: paged
                              .map(
                                (medicine) => DataRow(
                                  selected: selectedIds.contains(medicine.id),
                                  onSelectChanged: (value) {
                                    final newIds = Set<String>.from(selectedIds);
                                    if (value == true) {
                                      newIds.add(medicine.id);
                                    } else {
                                      newIds.remove(medicine.id);
                                    }
                                    ref.read(selectedMedicinesProvider.notifier).state = newIds;
                                  },
                                  cells: [
                                    const DataCell(SizedBox.shrink()),
                                    DataCell(
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            width: 40,
                                            height: 40,
                                            decoration: BoxDecoration(
                                              color: Theme.of(context)
                                                  .colorScheme
                                                  .primary
                                                  .withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Icon(
                                              Icons.medication,
                                              color: Theme.of(context).colorScheme.primary,
                                              size: 20,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Column(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                medicine.name,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              Text(
                                                medicine.nameAr,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    DataCell(Text(medicine.sku ?? '-')),
                                    DataCell(Text(medicine.categoryName ?? '-')),
                                    DataCell(Text(medicine.brandName ?? '-')),
                                    DataCell(Text(Formatters.formatCurrency(medicine.price))),
                                    DataCell(
                                      Text(
                                        medicine.stock.toString(),
                                        style: TextStyle(
                                          color: medicine.isLowStock ? Colors.orange : null,
                                          fontWeight:
                                              medicine.isLowStock ? FontWeight.w600 : null,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      StatusBadge(
                                        status: medicine.isActive ? 'active' : 'inactive',
                                      ),
                                    ),
                                    DataCell(
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.edit_outlined, size: 18),
                                            tooltip: 'Edit',
                                            onPressed: () =>
                                                _showEditMedicineDialog(context, ref, medicine),
                                          ),
                                          IconButton(
                                            icon: Icon(Icons.delete_outline, size: 18,
                                                color: Colors.red.shade400),
                                            tooltip: 'Delete',
                                            onPressed: () =>
                                                _confirmDelete(context, ref, medicine),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              )
                              .toList(),
                        ),
                      ),
                    ),
                    _buildPagination(context, ref, currentPage, totalPages, filtered.length),
                  ],
                ),
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: CircularProgressIndicator(),
              ),
            ),
            error: (e, _) => Center(child: Text('Error: $e')),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(BuildContext context, WidgetRef ref) {
    final searchQuery = ref.watch(medicineSearchProvider);
    final selectedCategory = ref.watch(medicineCategoryFilterProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              flex: 2,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search medicines...',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  isDense: true,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: isDark ? Colors.white10 : Colors.grey.shade100,
                ),
                onChanged: (value) {
                  ref.read(medicineSearchProvider.notifier).state = value;
                },
              ),
            ),
            const SizedBox(width: 16),
            SizedBox(
              width: 180,
              child: DropdownButtonFormField<String>(
                value: selectedCategory.isEmpty ? null : selectedCategory,
                hint: const Text('Category'),
                isDense: true,
                decoration: InputDecoration(
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                items: const [
                  DropdownMenuItem(value: 'Pain Relief', child: Text('Pain Relief')),
                  DropdownMenuItem(value: 'Antibiotics', child: Text('Antibiotics')),
                  DropdownMenuItem(value: 'Vitamins', child: Text('Vitamins')),
                  DropdownMenuItem(value: 'Allergy', child: Text('Allergy')),
                  DropdownMenuItem(value: 'Gastrointestinal', child: Text('Gastrointestinal')),
                ],
                onChanged: (value) {
                  ref.read(medicineCategoryFilterProvider.notifier).state = value ?? '';
                },
              ),
            ),
            const SizedBox(width: 16),
            ExportButton(
              fileName: 'medicines',
              headers: ['Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status'],
              data: [],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPagination(
      BuildContext context, WidgetRef ref, int currentPage, int totalPages, int totalItems) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Showing ${(currentPage - 1) * 10 + 1}-${(currentPage * 10).clamp(0, totalItems)} of $totalItems',
            style: TextStyle(
              fontSize: 13,
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white60
                  : Colors.grey.shade600,
            ),
          ),
          Row(
            children: [
              IconButton(
                onPressed: currentPage > 1
                    ? () => ref.read(medicinePageProvider.notifier).state = currentPage - 1
                    : null,
                icon: const Icon(Icons.chevron_left, size: 20),
              ),
              for (int i = 1; i <= totalPages.clamp(1, 5); i++)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(4),
                    onTap: () => ref.read(medicinePageProvider.notifier).state = i,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: currentPage == i
                            ? Theme.of(context).colorScheme.primary
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Center(
                        child: Text(
                          i.toString(),
                          style: TextStyle(
                            color: currentPage == i
                                ? Colors.white
                                : Theme.of(context).brightness == Brightness.dark
                                    ? Colors.white70
                                    : Colors.black54,
                            fontWeight:
                                currentPage == i ? FontWeight.w600 : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              IconButton(
                onPressed: currentPage < totalPages
                    ? () => ref.read(medicinePageProvider.notifier).state = currentPage + 1
                    : null,
                icon: const Icon(Icons.chevron_right, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddMedicineDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final nameArController = TextEditingController();
    final priceController = TextEditingController();
    final stockController = TextEditingController();
    final skuController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Medicine'),
        content: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  validator: (v) => Validators.required(v, 'Name'),
                  decoration: const InputDecoration(labelText: 'Name (English)'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: nameArController,
                  decoration: const InputDecoration(labelText: 'Name (Arabic)'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  validator: (v) => Validators.positiveNumber(v, 'Price'),
                  decoration: const InputDecoration(labelText: 'Price'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: stockController,
                  keyboardType: TextInputType.number,
                  validator: (v) => Validators.number(v, 'Stock'),
                  decoration: const InputDecoration(labelText: 'Stock'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: skuController,
                  decoration: const InputDecoration(labelText: 'SKU'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: const [
                    DropdownMenuItem(value: '1', child: Text('Pain Relief')),
                    DropdownMenuItem(value: '2', child: Text('Antibiotics')),
                    DropdownMenuItem(value: '3', child: Text('Vitamins')),
                  ],
                  onChanged: (v) {},
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Brand'),
                  items: const [
                    DropdownMenuItem(value: '1', child: Text('PharmaCo')),
                    DropdownMenuItem(value: '2', child: Text('MedLife')),
                  ],
                  onChanged: (v) {},
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Medicine added successfully')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showEditMedicineDialog(BuildContext context, WidgetRef ref, Medicine medicine) {
    final nameController = TextEditingController(text: medicine.name);
    final nameArController = TextEditingController(text: medicine.nameAr);
    final priceController = TextEditingController(text: medicine.price.toString());
    final stockController = TextEditingController(text: medicine.stock.toString());
    final skuController = TextEditingController(text: medicine.sku);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Medicine'),
        content: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Name (English)'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: nameArController,
                  decoration: const InputDecoration(labelText: 'Name (Arabic)'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Price'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: stockController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Stock'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: skuController,
                  decoration: const InputDecoration(labelText: 'SKU'),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Medicine updated successfully')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, Medicine medicine) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Medicine'),
        content: Text('Are you sure you want to delete "${medicine.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Medicine deleted')),
              );
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
