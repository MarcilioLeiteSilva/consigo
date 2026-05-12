import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

class PosSettlementScreen extends StatefulWidget {
  final POS pos;
  const PosSettlementScreen({super.key, required this.pos});

  @override
  State<PosSettlementScreen> createState() => _PosSettlementScreenState();
}

class _PosSettlementScreenState extends State<PosSettlementScreen> {
  final ApiClient _api = ApiClient();
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

  bool _isLoading = true;
  List<dynamic> _activeLots = [];
  List<Map<String, dynamic>> _inventoryItems = [];
  double _pendingTotal = 0;

  bool _isModalOpen = false;
  bool _isSaving = false;
  String _notes = '';
  String _startDate = '';
  String _endDate = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final responses = await Future.wait([
        _api.dio.get('/settlements/active-lots/${widget.pos.id}'),
        _api.dio.get('/settlements/pending-items/${widget.pos.id}'),
      ]);

      final lots = responses[0].data['data'] ?? responses[0].data;
      final pending = responses[1].data['data'] ?? responses[1].data;

      double total = 0;
      if (pending is List) {
        for (var item in pending) {
          total += double.tryParse(item['consignorAmount']?.toString() ?? '0') ?? 0;
        }
      }

      setState(() {
        _activeLots = lots is List ? lots : [];
        _pendingTotal = total;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar dados de fechamento: $e');
      setState(() => _isLoading = false);
    }
  }

  void _openInventoryModal() {
    _inventoryItems = _activeLots.map((l) {
      final received = int.tryParse(l['quantityReceived']?.toString() ?? '0') ?? 0;
      final sold = int.tryParse(l['quantitySold']?.toString() ?? '0') ?? 0;
      final returned = int.tryParse(l['quantityReturned']?.toString() ?? '0') ?? 0;
      return {
        'id': l['id'],
        'productName': l['product']?['name'] ?? 'Produto',
        'unitPrice': double.tryParse(l['unitPrice']?.toString() ?? '0') ?? 0,
        'received': received,
        'sold': sold,
        'returned': returned,
        'remainingQuantity': received - sold - returned,
        'controller': TextEditingController(text: '${received - sold - returned}'),
      };
    }).toList();

    setState(() => _isModalOpen = true);
  }

  Future<void> _confirmSettlement() async {
    if (_startDate.isEmpty || _endDate.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe o período de fechamento (Início e Fim)')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final items = _inventoryItems.map((item) => {
        'lotId': item['id'],
        'remainingQuantity': int.tryParse(
            (item['controller'] as TextEditingController).text) ?? item['remainingQuantity'],
      }).toList();

      await _api.dio.post('/settlements/inventory-based', data: {
        'posId': widget.pos.id,
        'items': items,
        'notes': _notes,
        'startDate': _startDate,
        'endDate': _endDate,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Fechamento realizado com sucesso!'),
            backgroundColor: Color(0xFF10B981),
          ),
        );
        setState(() {
          _isModalOpen = false;
          _notes = '';
          _startDate = '';
          _endDate = '';
        });
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao processar acerto: $e'), backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      final formatted = DateFormat('yyyy-MM-dd').format(picked);
      setState(() {
        if (isStart) {
          _startDate = formatted;
        } else {
          _endDate = formatted;
        }
      });
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
            Text(
              'Fechamento',
              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
            ),
            Text(
              widget.pos.name,
              style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
            ),
          ],
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _isModalOpen
              ? _buildInventoryModal()
              : _buildMainContent(),
    );
  }

  Widget _buildMainContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(25),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary cards
          FadeInDown(
            duration: const Duration(milliseconds: 500),
            child: Row(
              children: [
                Expanded(child: _buildSummaryCard(
                  'Lotes Ativos',
                  '${_activeLots.length}',
                  Icons.inventory_2_outlined,
                  const Color(0xFF6366F1),
                )),
                const SizedBox(width: 15),
                Expanded(child: _buildSummaryCard(
                  'Pendente',
                  _currencyFormat.format(_pendingTotal),
                  Icons.attach_money,
                  const Color(0xFFF59E0B),
                )),
              ],
            ),
          ),
          const SizedBox(height: 30),

          // Action button
          FadeInUp(
            duration: const Duration(milliseconds: 600),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _activeLots.isNotEmpty ? _openInventoryModal : null,
                icon: const Icon(Icons.content_paste, color: Colors.white),
                label: Text(
                  'Novo Fechamento (Inventário)',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  disabledBackgroundColor: Colors.grey[300],
                ),
              ),
            ),
          ),
          const SizedBox(height: 30),

          // Active lots
          Text(
            'Lotes Ativos no PDV',
            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
          ),
          const SizedBox(height: 15),

          if (_activeLots.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(30),
                child: Text('Nenhum lote ativo neste PDV', style: GoogleFonts.inter(color: Colors.grey)),
              ),
            )
          else
            ..._activeLots.asMap().entries.map((e) => FadeInUp(
              duration: Duration(milliseconds: 400 + (e.key * 50)),
              child: _buildLotItem(e.value),
            )),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(label, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
        ],
      ),
    );
  }

  Widget _buildLotItem(dynamic lot) {
    final productName = lot['product']?['name'] ?? 'Produto';
    final received = lot['quantityReceived'] ?? 0;
    final sold = lot['quantitySold'] ?? 0;
    final returned = lot['quantityReturned'] ?? 0;
    final stock = received - sold - returned;
    final unitPrice = double.tryParse(lot['unitPrice']?.toString() ?? '0') ?? 0;

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
            width: 45, height: 45,
            decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF64748B), size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(productName, style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text('Saldo: $stock un  •  ${_currencyFormat.format(unitPrice)}', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInventoryModal() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(25),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Realizar Fechamento', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
              ),
              IconButton(
                onPressed: () => setState(() => _isModalOpen = false),
                icon: const Icon(Icons.close, color: Color(0xFF64748B)),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Period
          Text('Período', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _pickDate(true),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 8),
                        Text(
                          _startDate.isNotEmpty ? _startDate : 'Início',
                          style: GoogleFonts.inter(fontSize: 13, color: _startDate.isNotEmpty ? const Color(0xFF0F172A) : const Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => _pickDate(false),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 8),
                        Text(
                          _endDate.isNotEmpty ? _endDate : 'Fim',
                          style: GoogleFonts.inter(fontSize: 13, color: _endDate.isNotEmpty ? const Color(0xFF0F172A) : const Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 25),

          // Inventory items
          Text('Inventário Atual', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
          const SizedBox(height: 10),

          ..._inventoryItems.map((item) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['productName'], style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF0F172A))),
                      Text('Enviado: ${item['received']}  •  Vendido: ${item['sold']}', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B))),
                    ],
                  ),
                ),
                SizedBox(
                  width: 70,
                  child: TextField(
                    controller: item['controller'] as TextEditingController,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16, color: const Color(0xFF6366F1)),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF6366F1))),
                    ),
                  ),
                ),
              ],
            ),
          )),

          const SizedBox(height: 20),

          // Notes
          TextField(
            onChanged: (v) => _notes = v,
            maxLines: 3,
            style: GoogleFonts.inter(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Observações (opcional)',
              hintStyle: GoogleFonts.inter(color: const Color(0xFF94A3B8)),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6366F1))),
            ),
          ),
          const SizedBox(height: 25),

          // Confirm button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _confirmSettlement,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isSaving
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text('Processar Acerto', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 15)),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}
