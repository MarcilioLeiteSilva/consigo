import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

class PosReturnScreen extends StatefulWidget {
  final POS pos;
  const PosReturnScreen({super.key, required this.pos});

  @override
  State<PosReturnScreen> createState() => _PosReturnScreenState();
}

class _PosReturnScreenState extends State<PosReturnScreen> {
  final ApiClient _api = ApiClient();
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
  
  bool _isLoading = true;
  bool _isSaving = false;
  List<ConsignmentLot> _lots = [];
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _loadLots();
  }

  Future<void> _loadLots() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/settlements/active-lots/${widget.pos.id}');
      final data = response.data['data'] ?? response.data;
      
      if (data is List) {
        setState(() {
          _lots = data.map((l) => ConsignmentLot.fromJson(l)).toList();
          for (var lot in _lots) {
            _controllers[lot.id] = TextEditingController();
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Erro ao carregar lotes: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar lotes: $e'), backgroundColor: Colors.redAccent),
        );
      }
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitReturn(ConsignmentLot lot) async {
    final qtyStr = _controllers[lot.id]?.text ?? '0';
    final qty = int.tryParse(qtyStr) ?? 0;

    if (qty <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe uma quantidade válida')),
      );
      return;
    }

    if (qty > lot.currentStock) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Quantidade maior que o saldo disponível (${lot.currentStock})')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      await _api.dio.post('/consignment-lots/${lot.id}/return', data: {
        'quantity': qty,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Produtos devolvidos ao estoque central!'),
            backgroundColor: Color(0xFF10B981),
          ),
        );
        _controllers[lot.id]?.clear();
        _loadLots(); // Refresh
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao processar devolução: $e'), backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Devolver Produtos', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
            Text(widget.pos.name, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
          ],
        ),
        leading: IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A))),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _lots.isEmpty
              ? _buildEmptyState()
              : _buildLotsList(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 60, color: Colors.grey.withOpacity(0.3)),
          const SizedBox(height: 15),
          Text('Nenhum lote ativo para devolução', style: GoogleFonts.inter(color: Colors.grey, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildLotsList() {
    return ListView.builder(
      padding: const EdgeInsets.all(25),
      itemCount: _lots.length,
      itemBuilder: (context, index) {
        final lot = _lots[index];
        return FadeInUp(
          duration: Duration(milliseconds: 300 + (index * 50)),
          child: _buildLotCard(lot),
        );
      },
    );
  }

  Widget _buildLotCard(ConsignmentLot lot) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF64748B), size: 20),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(lot.product?.name ?? 'Produto', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), fontSize: 14)),
                    Text('Saldo Atual: ${lot.currentStock} un', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF6366F1), fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 30, color: Color(0xFFF1F5F9)),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controllers[lot.id],
                  keyboardType: TextInputType.number,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: 'Qtd a devolver',
                    hintStyle: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 13, fontWeight: FontWeight.w400),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6366F1))),
                  ),
                ),
              ),
              const SizedBox(width: 15),
              ElevatedButton(
                onPressed: _isSaving ? null : () => _submitReturn(lot),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: _isSaving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send, color: Colors.white, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
