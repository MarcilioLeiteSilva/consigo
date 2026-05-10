import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

class LotFormScreen extends StatefulWidget {
  final ConsignmentLot? lot;
  final String? initialProductId;
  final String? initialPosId;
  const LotFormScreen({super.key, this.lot, this.initialProductId, this.initialPosId});

  @override
  State<LotFormScreen> createState() => _LotFormScreenState();
}

class _LotFormScreenState extends State<LotFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiClient _api = ApiClient();
  bool _isLoading = false;

  List<Product> _products = [];
  List<POS> _allPos = [];
  String? _selectedProductId;
  String? _selectedPosId;

  final _qtyController = TextEditingController();
  final _priceController = TextEditingController();
  final _commissionController = TextEditingController();
  final _notesController = TextEditingController();
  final _referenceController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.lot != null) {
      _selectedProductId = widget.lot!.productId;
      _selectedPosId = widget.lot!.posId;
      _qtyController.text = widget.lot!.quantityReceived.toString();
      _priceController.text = widget.lot!.unitPrice.toString();
      _commissionController.text = widget.lot!.commissionPercent.toString();
      _notesController.text = widget.lot!.notes ?? '';
      _referenceController.text = widget.lot!.reference ?? '';
    } else {
      _selectedProductId = widget.initialProductId;
      _selectedPosId = widget.initialPosId;
      _commissionController.text = '0.0';
    }
    _loadData().then((_) {
      if (_selectedPosId != null && widget.lot == null) {
        _updateCommissionFromPos(_selectedPosId!);
      }
    });
  }

  Future<void> _loadData() async {
    try {
      final res = await Future.wait([
        _api.dio.get('/products'),
        _api.dio.get('/pos'),
      ]);
      setState(() {
        _products = (res[0].data['data'] as List).map((j) => Product.fromJson(j)).toList();
        _allPos = (res[1].data['data'] as List).map((j) => POS.fromJson(j)).toList();
      });
    } catch (e) {
      debugPrint('Erro ao carregar dados: $e');
    }
  }

  void _updateCommissionFromPos(String? posId) {
    if (posId == null) {
      setState(() => _commissionController.text = '0.0');
      return;
    }
    try {
      final pos = _allPos.firstWhere((p) => p.id == posId);
      setState(() {
        _commissionController.text = pos.defaultCommission.toString();
      });
    } catch (_) {
      setState(() => _commissionController.text = '0.0');
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _selectedProductId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preencha os campos obrigatórios')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final data = {
        'productId': _selectedProductId,
        'posId': _selectedPosId,
        'quantityReceived': int.parse(_qtyController.text),
        'unitPrice': _priceController.text,
        'commissionPercent': _commissionController.text,
        'reference': _referenceController.text,
        'notes': _notesController.text,
      };

      if (widget.lot == null) {
        await _api.dio.post('/consignment-lots', data: data);
      } else {
        await _api.dio.patch('/consignment-lots/${widget.lot!.id}', data: data);
      }

      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Erro ao salvar lote')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.lot != null;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(isEditing ? 'Editar Lote' : 'Novo Lote', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(25),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLabel('Produto'),
              const SizedBox(height: 8),
              _buildDropdown<String>(
                value: _selectedProductId,
                hint: 'Selecione o produto',
                items: _products.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name))).toList(),
                onChanged: (v) => setState(() => _selectedProductId = v),
              ),
              const SizedBox(height: 15),
              _buildLabel('PDV de Destino'),
              const SizedBox(height: 8),
              _buildDropdown<String>(
                value: _selectedPosId,
                hint: 'Estoque Central',
                items: _allPos.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name))).toList(),
                onChanged: (v) {
                  setState(() => _selectedPosId = v);
                  _updateCommissionFromPos(v);
                },
              ),
              const SizedBox(height: 15),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _qtyController,
                      label: 'Quantidade',
                      hint: '0',
                      keyboardType: TextInputType.number,
                      validator: (v) => v!.isEmpty ? 'Obrigatório' : null,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildTextField(
                      controller: _commissionController,
                      label: 'Comissão (%)',
                      hint: '0.0',
                      keyboardType: TextInputType.number,
                      readOnly: true,
                      fillColor: const Color(0xFFF1F5F9),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _priceController,
                label: 'Preço Unitário (Venda)',
                hint: '0.00',
                keyboardType: TextInputType.number,
                validator: (v) => v!.isEmpty ? 'Obrigatório' : null,
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _referenceController,
                label: 'Referência (ex: Maio/2026)',
                hint: 'Identificação do lote...',
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _notesController,
                label: 'Observações',
                hint: 'Opcional...',
                maxLines: 2,
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(isEditing ? 'Salvar Alterações' : 'Criar Lote', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF64748B)),
    );
  }

  Widget _buildDropdown<T>({T? value, required String hint, required List<DropdownMenuItem<T>> items, required ValueChanged<T?>? onChanged}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          isExpanded: true,
          value: value,
          hint: Text(hint, style: GoogleFonts.inter(color: Colors.grey)),
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    bool readOnly = false,
    Color? fillColor,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          readOnly: readOnly,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: fillColor ?? Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
            ),
          ),
        ),
      ],
    );
  }
}
