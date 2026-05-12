import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/api_client.dart';

class SettlementReportScreen extends StatefulWidget {
  final String settlementId;
  const SettlementReportScreen({super.key, required this.settlementId});

  @override
  State<SettlementReportScreen> createState() => _SettlementReportScreenState();
}

class _SettlementReportScreenState extends State<SettlementReportScreen> {
  final ApiClient _api = ApiClient();
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
  final _dateFormat = DateFormat('dd/MM/yyyy HH:mm');
  final _dateOnlyFormat = DateFormat('dd/MM/yyyy');

  bool _isLoading = true;
  Map<String, dynamic>? _settlement;

  @override
  void initState() {
    super.initState();
    _loadSettlement();
  }

  Future<void> _loadSettlement() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/settlements/${widget.settlementId}');
      setState(() {
        _settlement = response.data['data'] ?? response.data;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar relatório: $e');
      setState(() => _isLoading = false);
    }
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/D';
    try {
      return _dateFormat.format(DateTime.parse(date.toString()));
    } catch (_) {
      return date.toString();
    }
  }

  String _formatOnlyDate(dynamic date) {
    if (date == null) return 'N/D';
    try {
      return _dateOnlyFormat.format(DateTime.parse(date.toString()));
    } catch (_) {
      return date.toString();
    }
  }

  void _handleShare() {
    if (_settlement == null) return;
    final posName = _settlement!['pos']?['name'] ?? 'PDV';
    final total = double.tryParse(_settlement!['totalAmount']?.toString() ?? '0') ?? 0;
    final id = (widget.settlementId).substring(0, 8).toUpperCase();

    SharePlus.instance.share(
      ShareParams(
        text: 'Relatório de Fechamento #$id\n'
            'PDV: $posName\n'
            'Total: ${_currencyFormat.format(total)}\n'
            'Data: ${_formatDate(_settlement!['settledAt'])}',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Relatório de Fechamento',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
        ),
        actions: [
          if (_settlement != null) ...[
            IconButton(
              onPressed: _handleShare,
              icon: const Icon(Icons.share_outlined, color: Color(0xFF64748B)),
              tooltip: 'Compartilhar',
            ),
          ],
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _settlement == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
                      const SizedBox(height: 15),
                      Text('Fechamento não encontrado', style: GoogleFonts.inter(color: Colors.grey)),
                      const SizedBox(height: 15),
                      ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Voltar')),
                    ],
                  ),
                )
              : _buildReport(),
    );
  }

  Widget _buildReport() {
    final s = _settlement!;
    final posName = s['pos']?['name'] ?? 'PDV';
    final posCity = s['pos']?['city'] ?? '';
    final posState = s['pos']?['state'] ?? '';
    final responsible = s['pos']?['responsibleName'] ?? 'Responsável';
    final settledAt = _formatDate(s['settledAt']);
    final startDate = _formatOnlyDate(s['startDate']);
    final endDate = _formatOnlyDate(s['endDate']);
    final totalAmount = double.tryParse(s['totalAmount']?.toString() ?? '0') ?? 0;
    final items = s['saleItems'] as List<dynamic>? ?? [];
    final notes = s['notes'] ?? '';
    final docId = widget.settlementId.substring(0, 8).toUpperCase();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: FadeInUp(
        duration: const Duration(milliseconds: 500),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withOpacity(0.05),
                blurRadius: 30,
                offset: const Offset(0, 15),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(25),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(32),
                    topRight: Radius.circular(32),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(color: const Color(0xFF6366F1), borderRadius: BorderRadius.circular(12)),
                          child: const Center(child: Text('C', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18))),
                        ),
                        const SizedBox(width: 10),
                        Text('Consigo SaaS', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('PONTO DE VENDA', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1)),
                              const SizedBox(height: 4),
                              Text(posName, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                              Text('$posCity - $posState', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('DOCUMENTO', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1)),
                            const SizedBox(height: 4),
                            Text('#$docId', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),
                    const Divider(color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _buildHeaderInfo('Data do Acerto', settledAt),
                        const SizedBox(width: 20),
                        _buildHeaderInfo('Período', '$startDate a $endDate'),
                      ],
                    ),
                  ],
                ),
              ),

              // Items
              Padding(
                padding: const EdgeInsets.all(25),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('DETALHAMENTO DE ITENS', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1)),
                    const SizedBox(height: 15),

                    if (items.isEmpty)
                      Text('Nenhum item registrado', style: GoogleFonts.inter(color: Colors.grey))
                    else
                      ...items.map((item) => _buildItemRow(item)),

                    const SizedBox(height: 20),
                    const Divider(color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 15),

                    // Notes
                    if (notes.isNotEmpty) ...[
                      Text('OBSERVAÇÕES', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1)),
                      const SizedBox(height: 8),
                      Text(notes, style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF64748B), fontStyle: FontStyle.italic)),
                      const SizedBox(height: 20),
                    ],

                    // Total
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('TOTAL A RECEBER', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white38, letterSpacing: 1)),
                                const SizedBox(height: 2),
                                Text(
                                  'Líquido para o Consignador', 
                                  style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF818CF8), fontStyle: FontStyle.italic),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            _currencyFormat.format(totalAmount),
                            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 25),

                    // Signatures
                    Row(
                      children: [
                        Expanded(child: _buildSignatureLine(responsible, posName)),
                        const SizedBox(width: 20),
                        Expanded(child: _buildSignatureLine('Administrador', 'Consigo')),
                      ],
                    ),

                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderInfo(String label, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: const Color(0xFF94A3B8), letterSpacing: 1)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF475569))),
        ],
      ),
    );
  }

  Widget _buildItemRow(dynamic item) {
    final productName = item['product']?['name'] ?? 'Produto';
    final sku = item['product']?['sku'] ?? 'N/A';
    final qty = item['quantity'] ?? 0;
    final unitPrice = double.tryParse(item['unitPrice']?.toString() ?? '0') ?? 0;
    final commission = item['commissionPercent'] ?? 0;
    final consignorAmount = double.tryParse(item['consignorAmount']?.toString() ?? '0') ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(productName, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: const Color(0xFF0F172A))),
                    Text('SKU: $sku', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              Text(_currencyFormat.format(consignorAmount), style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14, color: const Color(0xFF0F172A))),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildChip('Qtd: $qty'),
              const SizedBox(width: 6),
              _buildChip(_currencyFormat.format(unitPrice)),
              const SizedBox(width: 6),
              _buildChip('-$commission%', isRed: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String text, {bool isRed = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isRed ? Colors.redAccent.withOpacity(0.1) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: isRed ? Colors.redAccent : const Color(0xFF64748B)),
      ),
    );
  }

  Widget _buildSignatureLine(String name, String role) {
    return Column(
      children: [
        const Divider(color: Color(0xFFCBD5E1)),
        const SizedBox(height: 4),
        Text(name, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
        Text(role, style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
      ],
    );
  }
}
