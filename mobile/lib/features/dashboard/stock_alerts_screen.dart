import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_client.dart';
import '../lots/lot_form_screen.dart';

class StockAlertsScreen extends StatefulWidget {
  const StockAlertsScreen({super.key});

  @override
  State<StockAlertsScreen> createState() => _StockAlertsScreenState();
}

class _StockAlertsScreenState extends State<StockAlertsScreen> {
  final ApiClient _api = ApiClient();
  List<dynamic> _alerts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  Future<void> _loadAlerts() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/sales/stock-alerts');
      setState(() {
        _alerts = response.data['data'];
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar alertas de estoque: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Alertas de Estoque',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            onPressed: _loadAlerts,
            icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _alerts.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _alerts.length,
                  itemBuilder: (context, index) {
                    final alert = _alerts[index];
                    return FadeInUp(
                      duration: Duration(milliseconds: 300 + (index * 50)),
                      child: _buildAlertCard(alert),
                    );
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.check_circle_outline, size: 80, color: Colors.green.withOpacity(0.1)),
          const SizedBox(height: 20),
          Text(
            'Estoque em Dia!',
            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
          ),
          const SizedBox(height: 8),
          Text(
            'Nenhum produto com estoque crítico no momento.',
            style: GoogleFonts.inter(color: const Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertCard(dynamic alert) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => LotFormScreen(
              initialProductId: alert['productId'],
              initialPosId: alert['posId'],
            ),
          ),
        ).then((res) => {if (res == true) _loadAlerts()});
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.orangeAccent.withOpacity(0.2)),
          boxShadow: [
            BoxShadow(
              color: Colors.orangeAccent.withOpacity(0.05),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orangeAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
              ),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 28),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    alert['productName'],
                    style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 16, color: const Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'PDV: ${alert['posName']}',
                    style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF64748B), fontWeight: FontWeight.w500),
                  ),
                  Text(
                    alert['posCity'],
                    style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
            Column(
              children: [
                Text(
                  '${alert['available']}',
                  style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.redAccent),
                ),
                Text(
                  'restantes',
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.redAccent),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
