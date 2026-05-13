import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

class PosLossScreen extends StatefulWidget {
  final POS pos;
  const PosLossScreen({super.key, required this.pos});

  @override
  State<PosLossScreen> createState() => _PosLossScreenState();
}

class _PosLossScreenState extends State<PosLossScreen> {
  final ApiClient _api = ApiClient();
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
  
  bool _isLoading = true;
  bool _isSaving = false;
  List<ConsignmentLot> _lots = [];
  
  final Map<String, TextEditingController> _qtyControllers = {};
  final Map<String, TextEditingController> _reasonControllers = {};

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
            _qtyControllers[lot.id] = TextEditingController();
            _reasonControllers[lot.id] = TextEditingController();
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

  Future<void> _submitLoss(ConsignmentLot lot) async {
    final qtyStr = _qtyControllers[lot.id]?.text ?? '0';
    final qty = int.tryParse(qtyStr) ?? 0;
    final reason = _reasonControllers[lot.id]?.text ?? '';

    if (qty <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe uma quantidade válida')),
      );
      return;
    }

    if (reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe o motivo da perda')),
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
      await _api.dio.post('/consignment-lots/${lot.id}/loss', data: {
        'quantity': qty,
        'reason': reason,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Perda registrada com sucesso!'),
            backgroundColor: Colors.orangeAccent,
          ),
        );
        _qtyControllers[lot.id]?.clear();
        _reasonControllers[lot.id]?.clear();
        _loadLots(); // Refresh
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao registrar perda: $e'), backgroundColor: Colors.redAccent),
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
            Text('Registrar Perda', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
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
          Icon(Icons.report_problem_outlined, size: 60, color: Colors.grey.withOpacity(0.3)),
          const SizedBox(height: 15),
          Text('Nenhum lote ativo para registrar perda', style: GoogleFonts.inter(color: Colors.grey, fontWeight: FontWeight.w500)),
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
                decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.report_problem_outlined, color: Colors.redAccent, size: 20),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(lot.product?.name ?? 'Produto', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), fontSize: 14)),
                    Text('Saldo: ${lot.currentStock} un', style: GoogleFonts.inter(fontSize: 12, color: Colors.redAccent, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _qtyControllers[lot.id],
            keyboardType: TextInputType.number,
            style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16),
            decoration: InputDecoration(
              labelText: 'Quantidade Perdida',
              labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13),
              hintText: 'Ex: 2',
              isDense: true,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.redAccent)),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _reasonControllers[lot.id],
            maxLines: 2,
            style: GoogleFonts.inter(fontSize: 14),
            decoration: InputDecoration(
              labelText: 'Motivo / Descrição',
              labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13),
              hintText: 'Ex: Produto quebrado',
              isDense: true,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.redAccent)),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSaving ? null : () => _submitLoss(lot),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: _isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text('Registrar Perda', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
