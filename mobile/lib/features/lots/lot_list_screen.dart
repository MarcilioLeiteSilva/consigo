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
  List<ConsignmentLot> _networkLots = [];
  List<Product> _centralProducts = [];
  bool _isLoading = true;
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
        _api.dio.get('/consignment-lots'),
        _api.dio.get('/products'),
      ]);

      final List<dynamic> lotsData = responses[0].data['data'];
      final List<dynamic> productsData = responses[1].data['data'];

      setState(() {
        // Filtra lotes que possuem PDV para a aba "Estoque na Rede"
        _networkLots = lotsData
            .map((json) => ConsignmentLot.fromJson(json))
            .where((lot) => lot.posId != null)
            .toList();
        
        // Usa a lista de produtos (estoque total/central) para a aba "Estoque Central"
        _centralProducts = productsData.map((json) => Product.fromJson(json)).toList();
        
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar dados: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteLot(ConsignmentLot lot) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Excluir Lote', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text('Deseja realmente excluir o lote de "${lot.product?.name}"?'),
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
        _loadData();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Erro ao excluir lote.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: Text(
            'Gestão de Estoque',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
          ),
          actions: [
            IconButton(
              onPressed: _loadData,
              icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
            ),
          ],
          bottom: TabBar(
            labelColor: const Color(0xFF6366F1),
            unselectedLabelColor: const Color(0xFF94A3B8),
            indicatorColor: const Color(0xFF6366F1),
            indicatorWeight: 3,
            labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
            unselectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w500, fontSize: 13),
            tabs: const [
              Tab(text: 'Estoque Central'),
              Tab(text: 'Estoque na Rede'),
            ],
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : TabBarView(
                children: [
                  _buildCentralStockTab(),
                  _buildNetworkStockTab(),
                ],
              ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const LotFormScreen()),
            );
            if (result == true) _loadData();
          },
          backgroundColor: const Color(0xFF6366F1),
          icon: const Icon(Icons.add, color: Colors.white),
          label: Text('Novo Lote', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ),
    );
  }

  Widget _buildCentralStockTab() {
    if (_centralProducts.isEmpty) {
      return Center(child: Text('Nenhum produto em estoque central', style: GoogleFonts.inter(color: Colors.grey)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _centralProducts.length,
      itemBuilder: (context, index) {
        final product = _centralProducts[index];
        return FadeInUp(
          duration: Duration(milliseconds: 300 + (index * 50)),
          child: _buildProductStockCard(product),
        );
      },
    );
  }

  Widget _buildProductStockCard(Product product) {
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
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF6366F1)),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                ),
                Text(
                  'SKU: ${product.sku ?? "N/A"}',
                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
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
              '${product.totalStock} un',
              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w800, color: const Color(0xFF10B981)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkStockTab() {
    if (_networkLots.isEmpty) {
      return Center(child: Text('Nenhum lote consignado na rede', style: GoogleFonts.inter(color: Colors.grey)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _networkLots.length,
      itemBuilder: (context, index) {
        final lot = _networkLots[index];
        return FadeInUp(
          duration: Duration(milliseconds: 300 + (index * 50)),
          child: _buildLotCard(lot),
        );
      },
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
          ).then((_) => _loadData());
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
                          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                        ),
                        Text(
                          'PDV: ${lot.pos?.name ?? "N/A"}',
                          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${lot.currentStock} un',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF6366F1), fontSize: 12),
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (val) {
                      if (val == 'edit') {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => LotFormScreen(lot: lot)),
                        ).then((res) => {if (res == true) _loadData()});
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
              const SizedBox(height: 12),
              const Divider(color: Color(0xFFF1F5F9)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildMetric('Preço', _currencyFormat.format(lot.unitPrice)),
                  _buildMetric('Comissão', '${lot.commissionPercent}%'),
                  _buildMetric('Data', DateFormat('dd/MM/yy').format(lot.createdAt)),
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
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF94A3B8))),
        Text(value, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF475569))),
      ],
    );
  }
}
