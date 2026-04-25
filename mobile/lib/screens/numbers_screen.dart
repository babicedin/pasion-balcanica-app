import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../util/launchers.dart';
import '../widgets/icon_map.dart';
import '../widgets/primitives.dart';

/// Important numbers — tap any row to launch the dialer.
class NumbersScreen extends ConsumerWidget {
  const NumbersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);
    final async = ref.watch(importantNumbersProvider);
    final numbers = async.asData?.value ?? const <ImportantNumber>[];

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          const SliverToBoxAdapter(child: PBHeader()),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Kicker(s.justInCase),
                  const SizedBox(height: 6),
                  AccentHeadline(
                    pre: s.importantNumbersPre,
                    accent: s.importantNumbersAccent,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    s.tapToCall,
                    style: TextStyle(
                      fontSize: 13,
                      color: pb.ink3,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (async.isLoading)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator()),
              ),
            )
          else ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  decoration: BoxDecoration(
                    color: pb.bgElev,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: pb.hairline),
                    boxShadow: pb.glassShadow,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      for (var i = 0; i < numbers.length; i++) ...[
                        _NumberRow(
                          number: numbers[i],
                          locale: locale,
                          callLabel: s.callCta,
                          onTap: () => Launchers.call(numbers[i].phoneNumber),
                        ),
                        if (i < numbers.length - 1)
                          Divider(
                            height: 1,
                            thickness: 1,
                            color: pb.hairline,
                            indent: 16,
                            endIndent: 16,
                          ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 120)),
          ],
        ],
      ),
    );
  }
}

class _NumberRow extends StatelessWidget {
  final ImportantNumber number;
  final String locale;
  final String callLabel;
  final VoidCallback onTap;

  const _NumberRow({
    required this.number,
    required this.locale,
    required this.callLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: PBBrand.gradientSoft,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Icon(
                  iconForSlug(number.icon),
                  size: 18,
                  color: PBBrand.magenta,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      number.labelFor(locale),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: pb.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      number.phoneNumber,
                      style: TextStyle(
                        fontSize: 13,
                        color: pb.ink3,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
              GradientPill(
                onTap: onTap,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                child: Text(
                  callLabel.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
