import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class DeliveryPromiseSlider extends StatefulWidget {
  const DeliveryPromiseSlider({super.key});

  @override
  State<DeliveryPromiseSlider> createState() => _DeliveryPromiseSliderState();
}

class _DeliveryPromiseSliderState extends State<DeliveryPromiseSlider> {
  final PageController _controller = PageController();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 110,
          child: PageView(
            controller: _controller,
            children: [
              _buildPromiseCard(
                icon: Icons.timer_outlined,
                iconColor: Colors.amber,
                title: "60 MIN",
                subtitle: "DELIVERY",
                caption: "IN KALIMPONG & SILIGURI",
                isLive: true,
              ),
              _buildPromiseCard(
                icon: Icons.card_giftcard_rounded,
                iconColor: Colors.pinkAccent,
                title: "WAITLIST",
                subtitle: "GIVEAWAY",
                caption: "WIN ₹200–500 SHOPPING CREDIT",
                badge: "WIN",
              ),
              _buildPromiseCard(
                icon: Icons.local_shipping_outlined,
                iconColor: Colors.greenAccent,
                title: "FREE",
                subtitle: "DELIVERY",
                caption: "ON ORDERS OVER ₹1000",
                badge: "SAVE",
              ),
              _buildPromiseCard(
                icon: Icons.assignment_return_outlined,
                iconColor: Colors.lightBlueAccent,
                title: "EASY",
                subtitle: "REFUNDS",
                caption: "UNMATCHED QUALITY GUARANTEE",
                isLive: false,
                badge: "SECURE",
              ),
              _buildPromiseCard(
                icon: Icons.diamond_outlined,
                iconColor: Colors.deepPurpleAccent,
                title: "LOYALTY",
                subtitle: "REWARDS",
                caption: "BUY 5 TIMES → 30% OFF ON 6TH",
                badge: "GOLD",
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SmoothPageIndicator(
          controller: _controller,
          count: 5,
          effect: ScrollingDotsEffect(
            activeDotColor: Colors.black,
            dotColor: Colors.grey[300]!,
            dotHeight: 6,
            dotWidth: 6,
            spacing: 8,
          ),
        ),
      ],
    );
  }

  Widget _buildPromiseCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String caption,
    bool isLive = false,
    String? badge,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.black, Colors.grey[900]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: "$title ",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      TextSpan(
                        text: subtitle,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  caption,
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          if (isLive || badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: (isLive ? Colors.greenAccent : Colors.lightBlueAccent).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: (isLive ? Colors.greenAccent : Colors.lightBlueAccent).withOpacity(0.5),
                ),
              ),
              child: Text(
                isLive ? "LIVE" : badge!,
                style: TextStyle(
                  color: isLive ? Colors.greenAccent : Colors.lightBlueAccent,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
