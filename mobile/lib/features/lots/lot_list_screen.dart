import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';
import 'lot_form_screen.dart';
import 'lot_details_screen.dart';

class LotListScreen extends StatefulWidget {
  const LotListScreen({super.key});

  @override
  State<LotListScreen> createState() => _LotListScreenState();
}

class _LotListScreenState extends State<LotListScreen> {
  final ApiClient _api = ApiClient();
  List<ConsignmentLot> _lots = [];
  bool _isLoading = true;
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

  @override
  void initState() {
    super.initState();
    _loadLots();
  }

  Future<void> _loadLots() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/consignment-lots');
      final List<dynamic> data = response.data['data'];
      setState(() {
        _lots = data.map((json) => ConsignmentLot.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar lotes: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteLot(ConsignmentLot lot) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Excluir Lote', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text('Deseja realmente excluir o lote de "${lot.product?.name}"? Esta ação não pode ser desfeita.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancelar', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Excluir', style: GoogleFonts.inter(color: Colors.redAccent, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _api.dio.delete('/consignment-lots/${lot.id}');
        _loadLots();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Erro ao excluir lote. Verifique se há vendas vinculadas.')),
          );
        }
      }
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
          'Lotes e Estoque',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            onPressed: _loadLots,
            icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _lots.isEmpty
              ? Center(child: Text('Nenhum lote encontrado', style: GoogleFonts.inter(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _lots.length,
                  itemBuilder: (context, index) {
                    final lot = _lots[index];
                    return FadeInUp(
                      duration: Duration(milliseconds: 300 + (index * 50)),
                      child: _buildLotCard(lot),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const LotFormScreen()),
          );
          if (result == true) _loadLots();
        },
        backgroundColor: const Color(0xFF6366F1),
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Novo Lote', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
      ),
    );
  }

  Widget _buildLotCard(ConsignmentLot lot) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => LotDetailsScreen(lotId: lot.id)),
          ).then((_) => _loadLots());
        },
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lot.product?.name ?? 'Produto Desconhecido',
                          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                        ),
                        Text(
                          'PDV: ${lot.pos?.name ?? "Estoque Central"}',
                          style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF64748B)),
                        ),
                        if (lot.reference != null && lot.reference!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              'Ref: ${lot.reference}',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF6366F1)),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${lot.currentStock} un',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF6366F1)),
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (val) {
                      if (val == 'edit') {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => LotFormScreen(lot: lot)),
                        ).then((res) => {if (res == true) _loadLots()});
                      } else if (val == 'delete') {
                        _deleteLot(lot);
                      }
                    },
                    itemBuilder: (ctx) => [
                      const PopupMenuItem(value: 'edit', child: Text('Editar')),
                      const PopupMenuItem(value: 'delete', child: Text('Excluir', style: TextStyle(color: Colors.redAccent))),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 15),
              const Divider(color: Color(0xFFF1F5F9)),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildMetric('Custo/Venda', _currencyFormat.format(lot.unitPrice)),
                  _buildMetric('Comissão', '${lot.commissionPercent}%'),
                  _buildMetric('Entrada', DateFormat('dd/MM/yy').format(lot.createdAt)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8))),
        Text(value, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF475569))),
      ],
    );
  }
}
