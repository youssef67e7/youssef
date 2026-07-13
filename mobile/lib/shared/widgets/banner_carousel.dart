import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class BannerCarousel extends StatefulWidget {

  const BannerCarousel({
    super.key,
    required this.banners,
    this.height = 180,
    this.autoPlayDuration = const Duration(seconds: 4),
    this.onTap,
  });
  final List<BannerItem> banners;
  final double height;
  final Duration autoPlayDuration;
  final ValueChanged<int>? onTap;

  @override
  State<BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.92);
    _startAutoPlay();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoPlay() {
    Future.delayed(widget.autoPlayDuration, () {
      if (mounted && widget.banners.isNotEmpty) {
        final nextPage = (_currentPage + 1) % widget.banners.length;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeInOut,
        );
        _startAutoPlay();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (widget.banners.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        SizedBox(
          height: widget.height.h,
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.banners.length,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemBuilder: (context, index) {
              final banner = widget.banners[index];
              return GestureDetector(
                onTap: () => widget.onTap?.call(index),
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 4.w),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16.r),
                    gradient: LinearGradient(
                      colors: [
                        banner.color ?? theme.colorScheme.primary,
                        (banner.color ?? theme.colorScheme.primary)
                            .withOpacity(0.8),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        right: -20,
                        bottom: -20,
                        child: Icon(
                          banner.icon ?? Icons.local_pharmacy,
                          size: 120.r,
                          color: Colors.white.withOpacity(0.15),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.all(20.r),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              banner.title,
                              style: TextStyle(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(height: 6.h),
                            if (banner.subtitle != null)
                              Text(
                                banner.subtitle!,
                                style: TextStyle(
                                  fontSize: 13.sp,
                                  color: Colors.white.withOpacity(0.9),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        SizedBox(height: 12.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            widget.banners.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: EdgeInsets.symmetric(horizontal: 3.w),
              width: _currentPage == index ? 20.w : 6.w,
              height: 6.h,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(3.r),
                color: _currentPage == index
                    ? theme.colorScheme.primary
                    : theme.colorScheme.outline.withOpacity(0.3),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class BannerItem {

  const BannerItem({
    required this.title,
    this.subtitle,
    this.imageUrl,
    this.color,
    this.icon,
  });
  final String title;
  final String? subtitle;
  final String? imageUrl;
  final Color? color;
  final IconData? icon;
}
