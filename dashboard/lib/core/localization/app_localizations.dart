import 'dart:convert';
import 'package:flutter/services.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  late Map<String, String> _localizedStrings;

  Future<bool> load() async {
    String jsonString =
        await rootBundle.loadString('assets/translations/${locale.languageCode}.json');
    Map<String, dynamic> jsonMap = json.decode(jsonString);
    _localizedStrings =
        jsonMap.map((key, value) => MapEntry(key, value.toString()));
    return true;
  }

  String translate(String key) {
    return _localizedStrings[key] ?? key;
  }

  String get appName => translate('app_name');
  String get login => translate('login');
  String get logout => translate('logout');
  String get email => translate('email');
  String get password => translate('password');
  String get forgotPassword => translate('forgot_password');
  String get resetPassword => translate('reset_password');
  String get dashboard => translate('dashboard');
  String get medicines => translate('medicines');
  String get categories => translate('categories');
  String get brands => translate('brands');
  String get orders => translate('orders');
  String get customers => translate('customers');
  String get drivers => translate('drivers');
  String get coupons => translate('coupons');
  String get offers => translate('offers');
  String get banners => translate('banners');
  String get reviews => translate('reviews');
  String get notifications => translate('notifications');
  String get returns => translate('returns');
  String get analytics => translate('analytics');
  String get reports => translate('reports');
  String get auditLog => translate('audit_log');
  String get settings => translate('settings');
  String get users => translate('users');
  String get search => translate('search');
  String get filter => translate('filter');
  String get export => translate('export');
  String get import => translate('import');
  String get add => translate('add');
  String get edit => translate('edit');
  String get delete => translate('delete');
  String get save => translate('save');
  String get cancel => translate('cancel');
  String get confirm => translate('confirm');
  String get yes => translate('yes');
  String get no => translate('no');
  String get loading => translate('loading');
  String get noData => translate('no_data');
  String get error => translate('error');
  String get success => translate('success');
  String get totalRevenue => translate('total_revenue');
  String get totalOrders => translate('total_orders');
  String get totalCustomers => translate('total_customers');
  String get totalMedicines => translate('total_medicines');
  String get recentOrders => translate('recent_orders');
  String get topSellingMedicines => translate('top_selling_medicines');
  String get inventoryAlerts => translate('inventory_alerts');
  String get revenueChart => translate('revenue_chart');
  String get ordersChart => translate('orders_chart');
  String get customerGrowth => translate('customer_growth');
  String get orderStatus => translate('order_status');
  String get pending => translate('pending');
  String get confirmed => translate('confirmed');
  String get preparing => translate('preparing');
  String get ready => translate('ready');
  String get outForDelivery => translate('out_for_delivery');
  String get delivered => translate('delivered');
  String get cancelled => translate('cancelled');
  String get returned => translate('returned');
  String get name => translate('name');
  String get description => translate('description');
  String get price => translate('price');
  String get stock => translate('stock');
  String get category => translate('category');
  String get brand => translate('brand');
  String get status => translate('status');
  String get date => translate('date');
  String get actions => translate('actions');
  String get viewAll => translate('view_all');
  String get page => translate('page');
  String get of_ => translate('of_');
  String get rowsPerPage => translate('rows_per_page');
  String get selectAll => translate('select_all');
  String get selected => translate('selected');
  String get darkMode => translate('dark_mode');
  String get lightMode => translate('light_mode');
  String get language => translate('language');
  String get arabic => translate('arabic');
  String get english => translate('english');
  String get profile => translate('profile');
  String get generalSettings => translate('general_settings');
  String get paymentSettings => translate('payment_settings');
  String get deliverySettings => translate('delivery_settings');
  String get featureFlags => translate('feature_flags');
  String get maintenanceMode => translate('maintenance_mode');
  String get catalog => translate('catalog');
  String get operations => translate('operations');
  String get marketing => translate('marketing');
  String get content => translate('content');
  String get system => translate('system');
  String get analyticsAndReports => translate('analytics_and_reports');
  String get delivery => translate('delivery');
  String get sendNotification => translate('send_notification');
  String get notificationHistory => translate('notification_history');
  String get approve => translate('approve');
  String get reject => translate('reject');
  String get reply => translate('reply');
  String get block => translate('block');
  String get unblock => translate('unblock');
  String get assignDriver => translate('assign_driver');
  String get printInvoice => translate('print_invoice');
  String get earnings => translate('earnings');
  String get deliveryHistory => translate('delivery_history');
  String get generateReport => translate('generate_report');
  String get downloadPdf => translate('download_pdf');
  String get downloadExcel => translate('download_excel');
  String get dateRange => translate('date_range');
  String get from => translate('from');
  String get to => translate('to');
  String get active => translate('active');
  String get inactive => translate('inactive');
  String get all => translate('all');
  String get lowStock => translate('low_stock');
  String get expiringSoon => translate('expiring_soon');
  String get bulkActions => translate('bulk_actions');
  String get deleteSelected => translate('delete_selected');
  String get activateSelected => translate('activate_selected');
  String get deactivateSelected => translate('deactivate_selected');
  String get addNew => translate('add_new');
  String get updateExisting => translate('update_existing');
  String get noResultsFound => translate('no_results_found');
  String get tryDifferentSearch => translate('try_different_search');
  String get maintenanceTitle => translate('maintenance_title');
  String get maintenanceDescription => translate('maintenance_description');
  String get featureFlagTitle => translate('feature_flag_title');
  String get adminUsers => translate('admin_users');
  String get roles => translate('roles');
  String get permissions => translate('permissions');
  String get compare => translate('compare');
  String get period => translate('period');
  String get last7Days => translate('last_7_days');
  String get last30Days => translate('last_30_days');
  String get last12Months => translate('last_12_months');
  String get revenue => translate('revenue');
  String get ordersCount => translate('orders_count');
  String get avgOrderValue => translate('avg_order_value');
  String get conversionRate => translate('conversion_rate');
  String get totalSales => translate('total_sales');
  String get onlineDrivers => translate('online_drivers');
  String get pendingReturns => translate('pending_returns');
  String get scheduledOffers => translate('scheduled_offers');
  String get activeCoupons => translate('active_coupons');
  String get totalBanners => translate('total_banners');
  String get newCustomers => translate('new_customers');
  String get repeatCustomers => translate('repeat_customers');
  String get avgRating => translate('avg_rating');
  String get orderValue => translate('order_value');
  String get paymentMethod => translate('payment_method');
  String get customerName => translate('customer_name');
  String get driverName => translate('driver_name');
  String get totalAmount => translate('total_amount');
  String get grandTotal => translate('grand_total');
  String get subTotal => translate('sub_total');
  String get tax => translate('tax');
  String get discount => translate('discount');
  String get deliveryFee => translate('delivery_fee');
  String get medicineName => translate('medicine_name');
  String get quantity => translate('quantity');
  String get unitPrice => translate('unit_price');
  String get sku => translate('sku');
  String get barcode => translate('barcode');
  String get manufacturer => translate('manufacturer');
  String get expiryDate => translate('expiry_date');
  String get batchNumber => translate('batch_number');
  String get requiresPrescription => translate('requires_prescription');
  String get yesOption => translate('yes_option');
  String get noOption => translate('no_option');
  String get uploadImage => translate('upload_image');
  String get dragAndDrop => translate('drag_and_drop');
  String get reorder => translate('reorder');
  String get preview => translate('preview');
  String get schedule => translate('schedule');
  String get usageCount => translate('usage_count');
  String get maxUsage => translate('max_usage');
  String get validFrom => translate('valid_from');
  String get validTo => translate('valid_to');
  String get discountType => translate('discount_type');
  String get discountValue => translate('discount_value');
  String get minimumOrder => translate('minimum_order');
  String get couponCode => translate('coupon_code');
  String get offerTitle => translate('offer_title');
  String get bannerTitle => translate('banner_title');
  String get imageUrl => translate('image_url');
  String get link => translate('link');
  String get sortBy => translate('sort_by');
  String get ascending => translate('ascending');
  String get descending => translate('descending');
  String get resetFilters => translate('reset_filters');
  String get applyFilters => translate('apply_filters');
  String get viewDetails => translate('view_details');
  String get orderDetails => translate('order_details');
  String get customerDetails => translate('customer_details');
  String get driverDetails => translate('driver_details');
  String get noOrdersFound => translate('no_orders_found');
  String get noMedicinesFound => translate('no_medicines_found');
  String get noCustomersFound => translate('no_customers_found');
  String get noDriversFound => translate('no_drivers_found');
  String get confirmDelete => translate('confirm_delete');
  String get confirmBlock => translate('confirm_block');
  String get confirmApprove => translate('confirm_approve');
  String get confirmReject => translate('confirm_reject');
  String get operationSuccessful => translate('operation_successful');
  String get operationFailed => translate('operation_failed');
  String get networkError => translate('network_error');
  String get sessionExpired => translate('session_expired');
  String get accessDenied => translate('access_denied');
  String get adminReply => translate('admin_reply');
  String get writeReply => translate('write_reply');
  String get reason => translate('reason');
  String get enterReason => translate('enter_reason');
  String get refundAmount => translate('refund_amount');
  String get processRefund => translate('process_refund');
  String get refundProcessed => translate('refund_processed');
  String get selectDateRange => translate('select_date_range');
  String get comparisonView => translate('comparison_view');
  String get currentPeriod => translate('current_period');
  String get previousPeriod => translate('previous_period');
  String get change => translate('change');
  String get increase => translate('increase');
  String get decrease => translate('decrease');
  String get reportType => translate('report_type');
  String get salesReport => translate('sales_report');
  String get revenueReport => translate('revenue_report');
  String get inventoryReport => translate('inventory_report');
  String get customerReport => translate('customer_report');
  String get driverReport => translate('driver_report');
  String get generateAndDownload => translate('generate_and_download');
  String get timestamp => translate('timestamp');
  String get user => translate('user');
  String get action => translate('action');
  String get entity => translate('entity');
  String get entityID => translate('entity_id');
  String get ipAddress => translate('ip_address');
  String get details => translate('details');
  String get paymentGateways => translate('payment_gateways');
  String get deliveryZones => translate('delivery_zones');
  String get deliveryRadius => translate('delivery_radius');
  String get freeDeliveryThreshold => translate('free_delivery_threshold');
  String get platformFee => translate('platform_fee');
  String get taxRate => translate('tax_rate');
  String get storeName => translate('store_name');
  String get storeAddress => translate('store_address');
  String get storePhone => translate('store_phone');
  String get storeEmail => translate('store_email');
  String get currency => translate('currency');
  String get timezone => translate('timezone');
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'ar'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    AppLocalizations localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
