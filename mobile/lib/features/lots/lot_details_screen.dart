import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';
import 'lot_form_screen.dart';

class LotDetailsScreen extends StatefulWidget {
  final String lotId;
  const LotDetailsScreen({super.key, required this.lotId});

  @override
  State<LotDetailsScreen> createState() => _LotDetailsScreenState();
}

class _LotDetailsScreenState extends State<LotDetailsScreen> {
  final ApiClient _api = ApiClient();
  ConsignmentLot? _lot;
  bool _isLoading = true;
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

  @override
  void initState() {
    super.initState();
    _loadLot();
  }

  Future<void> _loadLot() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/consignment-lots/${widget.lotId}');
      setState(() {
        _lot = ConsignmentLot.fromJson(response.data['data'] ?? response.data);
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar detalhes do lote: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _lot == null
              ? const Center(child: Text('Lote não encontrado'))
              : CustomScrollView(
                  slivers: [
                    _buildAppBar(),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(25),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildStatusCard(),
                            const SizedBox(height: 25),
                            _buildStockGrid(),
                            const SizedBox(height: 35),
                            _buildSectionHeader('Informações do Lote'),
                            const SizedBox(height: 15),
                            _buildInfoList(),
                            const SizedBox(height: 35),
                            _buildActions(),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      pinned: true,
      backgroundColor: Colors.white,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 60, bottom: 16),
        title: Text(
          _lot?.product?.name ?? 'Detalhes do Lote',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
            fontSize: 18,
          ),
        ),
      ),
      actions: [
        IconButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => LotFormScreen(lot: _lot)),
            ).then((res) {
              if (res == true) _loadLot();
            });
          },
          icon: const Icon(Icons.edit_outlined, color: Color(0xFF64748B)),
        ),
        const SizedBox(width: 10),
      ],
    );
  }

  Widget _buildStatusCard() {
    final isClosed = _lot?.quantitySold == _lot?.quantityReceived; // Placeholder logic
    return FadeInDown(
      duration: const Duration(milliseconds: 400),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        decoration: BoxDecoration(
          color: isClosed ? Colors.grey.withOpacity(0.1) : const Color(0xFF6366F1).withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Row(
          children: [
            Icon(
              isClosed ? Icons.check_circle_outline : Icons.inventory_2_outlined,
              color: isClosed ? Colors.grey : const Color(0xFF6366F1),
            ),
            const SizedBox(width: 12),
            Text(
              isClosed ? 'Lote Concluído' : 'Lote Ativo / Em Venda',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: isClosed ? Colors.grey : const Color(0xFF6366F1),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStockGrid() {
    return FadeInUp(
      duration: const Duration(milliseconds: 500),
      child: Column(
        children: [
          Row(
            children: [
              _buildStockCard('Recebido', '${_lot?.quantityReceived}', const Color(0xFF6366F1)),
              const SizedBox(width: 15),
              _buildStockCard('Vendido', '${_lot?.quantitySold}', const Color(0xFF10B981)),
            ],
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              _buildStockCard('Devolvido', '${_lot?.quantityReturned}', const Color(0xFFF59E0B)),
              const SizedBox(width: 15),
              _buildStockCard('Saldo Atual', '${_lot?.currentStock}', const Color(0xFFEC4899), isHighlight: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStockCard(String label, String value, Color color, {bool isHighlight = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isHighlight ? color : Colors.white,
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
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: isHighlight ? Colors.white.withOpacity(0.8) : const Color(0xFF64748B),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              value,
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: isHighlight ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: const Color(0xFF0F172A),
      ),
    );
  }

  Widget _buildInfoList() {
    return Container(
      padding: const EdgeInsets.all(25),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        children: [
          _buildInfoRow('Referência', _lot?.reference ?? 'N/A', Icons.tag),
          const Divider(height: 30),
          _buildInfoRow('PDV Destino', _lot?.pos?.name ?? 'Estoque Central', Icons.store_outlined),
          const Divider(height: 30),
          _buildInfoRow('Data Entrada', DateFormat('dd/MM/yyyy HH:mm').format(_lot!.createdAt), Icons.calendar_today_outlined),
          const Divider(height: 30),
          _buildInfoRow('Preço Unitário', _currencyFormat.format(_lot?.unitPrice), Icons.payments_outlined),
          const Divider(height: 30),
          _buildInfoRow('Comissão PDV', '${_lot?.commissionPercent}%', Icons.percent),
          if (_lot?.notes != null && _lot!.notes!.isNotEmpty) ...[
            const Divider(height: 30),
            _buildInfoRow('Observações', _lot!.notes!, Icons.notes),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActions() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              // Navegar para nova venda já com este lote pré-selecionado se possível
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Funcionalidade de venda rápida em breve')));
            },
            icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
            label: const Text('Registrar Venda', style: TextStyle(color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
            ),
          ),
        ),
      ],
    );
  }
}
