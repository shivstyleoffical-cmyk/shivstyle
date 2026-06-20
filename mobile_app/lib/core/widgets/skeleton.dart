import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';

class Skeleton extends StatefulWidget {
  final double? height;
  final double? width;
  final double borderRadius;

  const Skeleton({
    super.key,
    this.height,
    this.width,
    this.borderRadius = 8,
  });

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 0.8).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: Container(
        height: widget.height,
        width: widget.width,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.1),
          borderRadius: BorderRadius.all(Radius.circular(widget.borderRadius)),
        ),
      ),
    );
  }
}

class CategorySkeleton extends StatelessWidget {
  const CategorySkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Skeleton(
          height: 100,
          width: 100,
          borderRadius: 20,
        ),
        const SizedBox(height: 8),
        Skeleton(
          height: 15,
          width: 60,
          borderRadius: 4,
        ),
      ],
    );
  }
}

class CategoryGridSkeleton extends StatelessWidget {
  const CategoryGridSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.85,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Expanded(
              child: Skeleton(
                borderRadius: 12,
              ),
            ),
            const SizedBox(height: 12),
            Skeleton(
              height: 16,
              width: 80,
              borderRadius: 4,
            ),
          ],
        ),
      ),
    );
  }
}
class HomeScreenSkeleton extends StatelessWidget {
  const HomeScreenSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      physics: const NeverScrollableScrollPhysics(),
      children: [
        const SizedBox(height: 16),
        const Skeleton(height: 15, width: 120),
        const SizedBox(height: 8),
        const Skeleton(height: 30, width: 200),
        const SizedBox(height: 24),
        const Skeleton(height: 55, borderRadius: 16),
        const SizedBox(height: 32),
        const Skeleton(height: 20, width: 150),
        const SizedBox(height: 16),
        SizedBox(
          height: 100,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: 5,
            separatorBuilder: (_, __) => const SizedBox(width: 16),
            itemBuilder: (_, __) => const Column(
              children: [
                Skeleton(height: 70, width: 70, borderRadius: 15),
                SizedBox(height: 8),
                Skeleton(height: 10, width: 50),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),
        const Skeleton(height: 20, width: 150),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 0.72,
          ),
          itemCount: 4,
          itemBuilder: (_, __) => const Skeleton(borderRadius: 20),
        ),
      ],
    );
  }
}
class ProductGridSkeleton extends StatelessWidget {
  const ProductGridSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.72,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Expanded(
              child: Skeleton(
                borderRadius: 12,
              ),
            ),
            const SizedBox(height: 12),
            const Skeleton(height: 16, width: 100),
            const SizedBox(height: 8),
            const Skeleton(height: 14, width: 60),
          ],
        ),
      ),
    );
  }
}

class ProductListingSkeleton extends StatelessWidget {
  const ProductListingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Skeleton(height: 15, width: 80),
          const SizedBox(height: 16),
          const Expanded(child: ProductGridSkeleton()),
        ],
      ),
    );
  }
}

class OrderSkeleton extends StatelessWidget {
  const OrderSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) => Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            Row(
              children: [
                const Skeleton(height: 40, width: 40, borderRadius: 8),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Skeleton(height: 14, width: 120),
                      SizedBox(height: 8),
                      Skeleton(height: 10, width: 80),
                    ],
                  ),
                ),
                const Skeleton(height: 25, width: 60, borderRadius: 20),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Skeleton(height: 15, width: 80),
                Skeleton(height: 15, width: 60),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
