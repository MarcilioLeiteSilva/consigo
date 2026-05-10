import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/api_client.dart';
import 'package:intl/intl.dart';
import '../auth/login_screen.dart';
import '../pos/pos_list_screen.dart';
import '../products/product_list_screen.dart';
import 'stock_alerts_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiClient _api = ApiClient();
  bool _isLoading = true;
  Map<String, dynamic>? _metrics;
  List<dynamic> _chartData = [];
  List<dynamic> _topProducts = [];
  String _userName = 'Parceiro';

  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final responses = await Future.wait([
        _api.dio.get('/dashboard/metrics'),
        _api.dio.get('/dashboard/sales-chart'),
        _api.dio.get('/dashboard/top-products'),
        _api.dio.get('/auth/me'),
      ]);

      setState(() {
        _metrics = responses[0].data['data'];
        _chartData = responses[1].data['data'] ?? [];
        _topProducts = responses[2].data['data'] ?? [];
        final profile = responses[3].data['data'] ?? responses[3].data;
        _userName = profile['name'] ?? 'Parceiro';
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar dados do dashboard: $e');
      setState(() => _isLoading = false);
    }
  }

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Sair', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: const Text('Deseja realmente sair da conta?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancelar', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              await ApiClient().logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: Text('Sair', style: GoogleFonts.inter(color: Colors.redAccent, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            _buildAppBar(),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(25),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildGreeting(),
                    const SizedBox(height: 30),
                    _buildKPIGrid(),
                    const SizedBox(height: 35),
                    _buildSectionHeader('Gestão Rápida', 'Acesse módulos principais'),
                    const SizedBox(height: 15),
                    _buildQuickActions(),
                    const SizedBox(height: 35),
                    _buildSectionHeader('Análise de Vendas', 'Últimos 7 dias'),
                    const SizedBox(height: 15),
                    _buildSalesChart(),
                    const SizedBox(height: 35),
                    _buildSectionHeader('Gestão Operacional', 'Ações de monitoramento'),
                    const SizedBox(height: 15),
                    _buildAdvancedActions(),
                    const SizedBox(height: 35),
                    _buildSectionHeader('Produtos Mais Vendidos', 'Ranking de saída'),
                    const SizedBox(height: 15),
                    _buildTopProducts(),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      leading: Padding(
        padding: const EdgeInsets.only(left: 20, top: 10, bottom: 10),
        child: Image.asset('assets/images/logo.png'),
      ),
      leadingWidth: 60,
      title: Text(
        'Consigo',
        style: GoogleFonts.outfit(
          fontSize: 24,
          fontWeight: FontWeight.w800,
          color: const Color(0xFF0F172A),
          letterSpacing: -0.5,
        ),
      ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: const Badge(
            label: Text('3'),
            child: Icon(Icons.notifications_none, color: Color(0xFF64748B)),
          ),
        ),
        const SizedBox(width: 5),
        IconButton(
          onPressed: () => _handleLogout(context),
          icon: const Icon(Icons.logout, color: Color(0xFF64748B), size: 22),
        ),
        const SizedBox(width: 10),
        Padding(
          padding: const EdgeInsets.only(right: 20),
          child: CircleAvatar(
            radius: 18,
            backgroundColor: const Color(0xFF6366F1),
            child: Text(
              _userName.substring(0, 1).toUpperCase(), 
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGreeting() {
    return FadeInDown(
      duration: const Duration(milliseconds: 500),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Olá, $_userName 👋',
            style: GoogleFonts.outfit(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0F172A),
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Confira o desempenho da sua operação hoje.',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKPIGrid() {
    return FadeInUp(
      duration: const Duration(milliseconds: 600),
      child: Column(
        children: [
          Row(
            children: [
              _buildKPIItem(
                label: 'Vendas Hoje',
                value: _currencyFormat.format(double.tryParse(_metrics?['salesToday']?.toString() ?? '0') ?? 0),
                trend: '+12%',
                icon: Icons.shopping_bag_outlined,
                color: const Color(0xFF6366F1),
              ),
              const SizedBox(width: 15),
              _buildKPIItem(
                label: 'Ticket Médio',
                value: _currencyFormat.format(double.tryParse(_metrics?['avgTicket']?.toString() ?? '0') ?? 0),
                trend: '+5%',
                icon: Icons.trending_up,
                color: const Color(0xFF10B981),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              _buildKPIItem(
                label: 'Estoque Total',
                value: '${_metrics?['totalStock'] ?? 0} un',
                icon: Icons.inventory_2_outlined,
                color: const Color(0xFFF59E0B),
              ),
              const SizedBox(width: 15),
              _buildKPIItem(
                label: 'PDVs Ativos',
                value: '${_metrics?['activePosCount'] ?? 0}',
                icon: Icons.store_outlined,
                color: const Color(0xFFEC4899),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKPIItem({
    required String label,
    required String value,
    String? trend,
    required IconData icon,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0F172A).withOpacity(0.03),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                if (trend != null)
                  Text(
                    trend,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF10B981),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 15),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: const Color(0xFF64748B),
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
        ),
        Text(
          subtitle,
          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B), fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _buildQuickActionCard(
          'PDVs',
          Icons.storefront_rounded,
          const Color(0xFF6366F1),
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const PosListScreen()));
          },
        ),
        const SizedBox(width: 15),
        _buildQuickActionCard(
          'Produtos',
          Icons.inventory_2_rounded,
          const Color(0xFFF59E0B),
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ProductListScreen()));
          },
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(String label, IconData icon, Color color, {VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withOpacity(0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                child: Icon(icon, color: color, size: 26),
              ),
              const SizedBox(height: 12),
              Text(
                label,
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSalesChart() {
    if (_chartData.isEmpty) return const SizedBox.shrink();

    return FadeInUp(
      delay: const Duration(milliseconds: 200),
      child: Container(
        padding: const EdgeInsets.all(25),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Histórico de Vendas',
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                    ),
                    Text(
                      'Últimos 7 dias',
                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B), fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 25),
            SizedBox(
              height: 180,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: _chartData.asMap().entries.map((e) {
                        return FlSpot(e.key.toDouble(), double.tryParse(e.value['total'].toString()) ?? 0);
                      }).toList(),
                      isCurved: true,
                      color: const Color(0xFF6366F1),
                      barWidth: 4,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: const Color(0xFF6366F1).withOpacity(0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdvancedActions() {
    final lowStockCount = _metrics?['lowStockCount'] ?? 0;
    
    return Row(
      children: [
        _buildActionCard(
          'Estoque Baixo', 
          Icons.warning_amber_rounded, 
          Colors.orangeAccent,
          badge: lowStockCount > 0 ? '$lowStockCount' : null,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const StockAlertsScreen()));
          },
        ),
        const SizedBox(width: 15),
        _buildActionCard(
          'Fechamento', 
          Icons.account_balance_wallet_rounded, 
          Colors.purpleAccent,
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Módulo de fechamento em desenvolvimento')));
          },
        ),
      ],
    );
  }

  Widget _buildActionCard(String label, IconData icon, Color color, {String? badge, VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withOpacity(0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                    child: Icon(icon, color: color, size: 24),
                  ),
                  if (badge != null)
                    Positioned(
                      top: -5,
                      right: -5,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                        constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                        child: Text(
                          badge,
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                label,
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopProducts() {
    if (_topProducts.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Text('Nenhum dado disponível', style: GoogleFonts.inter(color: Colors.grey)),
        ),
      );
    }

    return FadeInUp(
      delay: const Duration(milliseconds: 300),
      child: Column(
        children: _topProducts.asMap().entries.map((e) {
          final p = e.value;
          return _buildProductItem(p['name'], '${p['quantity']} un vendidas', e.key);
        }).toList(),
      ),
    );
  }

  Widget _buildProductItem(String name, String qty, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            width: 45,
            height: 45,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                '${index + 1}',
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: const Color(0xFF64748B)),
              ),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                ),
                Text(
                  qty,
                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                ),
              ],
            ),
          ),
          const Icon(Icons.trending_up, color: Color(0xFF10B981), size: 18),
        ],
      ),
    );
  }
}
