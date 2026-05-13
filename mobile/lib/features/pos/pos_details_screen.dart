import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';
import 'pos_form_screen.dart';
import 'pos_map_screen.dart';
import 'pos_settlement_screen.dart';
import 'pos_return_screen.dart';
import 'pos_loss_screen.dart';

class PosDetailsScreen extends StatefulWidget {
  final POS pos;
  const PosDetailsScreen({super.key, required this.pos});

  @override
  State<PosDetailsScreen> createState() => _PosDetailsScreenState();
}

class _PosDetailsScreenState extends State<PosDetailsScreen> {
  final ApiClient _api = ApiClient();
  bool _isLoading = true;
  late POS _currentPos;
  List<ConsignmentLot> _lots = [];
  final _currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

  @override
  void initState() {
    super.initState();
    _currentPos = widget.pos;
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/pos/${_currentPos.id}');
      final data = response.data['data'];
      
      setState(() {
        _currentPos = POS.fromJson(data);
        if (data['consignmentLots'] != null) {
          _lots = (data['consignmentLots'] as List)
              .map((l) => ConsignmentLot.fromJson(l))
              .toList();
        }
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar detalhes do PDV: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(25),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoCard(),
                  const SizedBox(height: 30),
                  _buildSectionHeader('Estoque no PDV', '${_lots.length} lotes ativos'),
                  const SizedBox(height: 15),
                  _buildLotsList(),
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
      backgroundColor: const Color(0xFF6366F1),
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: const Icon(Icons.arrow_back, color: Colors.white),
      ),
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          _currentPos.name,
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w700,
            color: Colors.white,
            fontSize: 18,
          ),
        ),
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
              colors: [Color(0xFF818CF8), Color(0xFF6366F1)],
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => PosFormScreen(pos: _currentPos)),
            );
            if (result == true) _loadData();
          },
          icon: const Icon(Icons.edit_outlined, color: Colors.white),
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onSelected: (value) {
            switch (value) {
              case 'abastecer':
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Módulo Abastecer em breve')));
                break;
              case 'devolver':
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => PosReturnScreen(pos: _currentPos)),
                ).then((_) => _loadData());
                break;
              case 'perda':
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => PosLossScreen(pos: _currentPos)),
                ).then((_) => _loadData());
                break;
              case 'fechamento':
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => PosSettlementScreen(pos: _currentPos)),
                );
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'abastecer',
              child: Row(
                children: [
                  Icon(Icons.add_shopping_cart, color: Color(0xFF6366F1), size: 20),
                  SizedBox(width: 12),
                  Text('Abastecer'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'devolver',
              child: Row(
                children: [
                  Icon(Icons.assignment_return_outlined, color: Color(0xFF6366F1), size: 20),
                  SizedBox(width: 12),
                  Text('Devolver produtos'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'perda',
              child: Row(
                children: [
                  Icon(Icons.report_problem_outlined, color: Colors.redAccent, size: 20),
                  SizedBox(width: 12),
                  Text('Registrar perda'),
                ],
              ),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(
              value: 'fechamento',
              child: Row(
                children: [
                  Icon(Icons.account_balance_wallet_outlined, color: Colors.purpleAccent, size: 20),
                  SizedBox(width: 12),
                  Text('Fazer fechamento'),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(width: 5),
      ],
    );
  }

  Widget _buildInfoCard() {
    return FadeInDown(
      duration: const Duration(milliseconds: 500),
      child: Container(
        padding: const EdgeInsets.all(25),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
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
          children: [
            _buildInfoRow(Icons.person_outline, 'Responsável', _currentPos.responsibleName ?? 'Não informado'),
            const Divider(height: 30, color: Color(0xFFF1F5F9)),
            _buildInfoRow(Icons.phone_outlined, 'WhatsApp', _currentPos.whatsapp ?? 'Não informado'),
            const Divider(height: 30, color: Color(0xFFF1F5F9)),
            InkWell(
              onTap: () {
                final fullAddress = '${_currentPos.city}, ${_currentPos.state}, ${_currentPos.location ?? ""}';
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => PosMapScreen(
                      address: fullAddress,
                      posName: _currentPos.name,
                    ),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(12),
              child: _buildInfoRow(Icons.location_on_outlined, 'Endereço', '${_currentPos.city ?? ''} - ${_currentPos.state ?? ''}'),
            ),
            const Divider(height: 30, color: Color(0xFFF1F5F9)),
            _buildInfoRow(Icons.percent_outlined, 'Comissão Padrão', '${_currentPos.defaultCommission}%'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFF6366F1).withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 20, color: const Color(0xFF6366F1)),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label.toUpperCase(),
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF94A3B8), letterSpacing: 0.5),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF1E293B)),
              ),
            ],
          ),
        ),
      ],
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

  Widget _buildLotsList() {
    if (_isLoading) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(40),
        child: CircularProgressIndicator(),
      ));
    }

    if (_lots.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          children: [
            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey[200]),
            const SizedBox(height: 15),
            Text(
              'Nenhum lote ativo neste PDV',
              style: GoogleFonts.inter(color: Colors.grey[400], fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    }

    return Column(
      children: _lots.map((lot) => _buildLotCard(lot)).toList(),
    );
  }

  Widget _buildLotCard(ConsignmentLot lot) {
    return FadeInUp(
      duration: const Duration(milliseconds: 400),
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF64748B), size: 24),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lot.product?.name ?? 'Produto Desconhecido',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        'Saldo: ',
                        style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                      ),
                      Text(
                        '${lot.currentStock} un',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF6366F1)),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '•  ${_currencyFormat.format(lot.unitPrice)}',
                        style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
          ],
        ),
      ),
    );
  }
}
