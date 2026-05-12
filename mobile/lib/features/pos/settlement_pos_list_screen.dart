import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';
import 'pos_settlement_screen.dart';

class SettlementPosListScreen extends StatefulWidget {
  const SettlementPosListScreen({super.key});

  @override
  State<SettlementPosListScreen> createState() => _SettlementPosListScreenState();
}

class _SettlementPosListScreenState extends State<SettlementPosListScreen> {
  final ApiClient _api = ApiClient();
  List<POS> _posList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPos();
  }

  Future<void> _loadPos() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/pos');
      final List<dynamic> data = response.data['data'];
      setState(() {
        _posList = data.map((json) => POS.fromJson(json)).where((p) => p.isActive).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar PDVs: $e');
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
        centerTitle: false,
        title: Text(
          'Fechamento por PDV',
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            onPressed: _loadPos,
            icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _posList.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.store_outlined, size: 60, color: Colors.grey.withOpacity(0.3)),
                      const SizedBox(height: 15),
                      Text(
                        'Nenhum PDV ativo encontrado',
                        style: GoogleFonts.inter(color: Colors.grey, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _posList.length,
                  itemBuilder: (context, index) {
                    final pos = _posList[index];
                    return FadeInUp(
                      duration: Duration(milliseconds: 300 + (index * 50)),
                      child: _buildPosCard(pos),
                    );
                  },
                ),
    );
  }

  Widget _buildPosCard(POS pos) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => PosSettlementScreen(pos: pos)),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
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
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.purpleAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.purpleAccent, size: 24),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pos.name,
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                  if (pos.responsibleName != null)
                    Text(
                      pos.responsibleName!,
                      style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF64748B)),
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Ativo',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF10B981),
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
          ],
        ),
      ),
    );
  }
}
