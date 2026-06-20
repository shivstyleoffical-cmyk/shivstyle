import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../models/category_model.dart';

class CategoryChip extends StatelessWidget {
  final CategoryModel category;
  final VoidCallback? onTap;

  const CategoryChip({
    super.key,
    required this.category,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 20),
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: category.imageUrl != null
                    ? Image.network(
                        category.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => const Icon(
                          Icons.category_rounded,
                          color: AppColors.primary,
                          size: 32,
                        ),
                      )
                    : const Icon(
                        Icons.category_rounded,
                        color: AppColors.primary,
                        size: 32,
                      ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: 70,
              child: Text(
                category.name,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.accent,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
