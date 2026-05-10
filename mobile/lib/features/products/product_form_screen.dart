import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

class ProductFormScreen extends StatefulWidget {
  final Product? product;
  const ProductFormScreen({super.key, this.product});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiClient _api = ApiClient();
  bool _isLoading = false;
  List<Category> _categories = [];

  late TextEditingController _nameController;
  late TextEditingController _skuController;
  late TextEditingController _descriptionController;
  late TextEditingController _imageUrlController;
  late TextEditingController _unitController;
  String? _selectedCategoryId;
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product?.name ?? '');
    _skuController = TextEditingController(text: widget.product?.sku ?? '');
    _descriptionController = TextEditingController(text: widget.product?.description ?? '');
    _imageUrlController = TextEditingController(text: widget.product?.imageUrl ?? '');
    _unitController = TextEditingController(text: widget.product?.unit ?? 'un');
    _selectedCategoryId = widget.product?.categoryId;
    _isActive = widget.product?.isActive ?? true;
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final response = await _api.dio.get('/categories');
      final List<dynamic> data = response.data['data'];
      setState(() {
        _categories = data.map((json) => Category.fromJson(json)).toList();
      });
    } catch (e) {
      debugPrint('Erro ao carregar categorias: $e');
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final data = {
        'name': _nameController.text,
        'sku': _skuController.text,
        'description': _descriptionController.text,
        'imageUrl': _imageUrlController.text,
        'unit': _unitController.text,
        'categoryId': _selectedCategoryId,
        'isActive': _isActive,
      };

      if (widget.product == null) {
        await _api.dio.post('/products', data: data);
      } else {
        await _api.dio.patch('/products/${widget.product!.id}', data: data);
      }

      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao salvar produto')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
          widget.product == null ? 'Novo Produto' : 'Editar Produto',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(25),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTextField(
                controller: _nameController,
                label: 'Nome do Produto',
                hint: 'Ex: Camiseta Polo',
                validator: (v) => v!.isEmpty ? 'Obrigatório' : null,
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _skuController,
                label: 'SKU / Código',
                hint: 'Ex: PROD-001',
              ),
              const SizedBox(height: 15),
              _buildLabel('Categoria'),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 15),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedCategoryId,
                    hint: Text('Selecione uma categoria', style: GoogleFonts.inter(color: Colors.grey)),
                    items: _categories.map((c) {
                      return DropdownMenuItem(value: c.id, child: Text(c.name));
                    }).toList(),
                    onChanged: (v) => setState(() => _selectedCategoryId = v),
                  ),
                ),
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _unitController,
                label: 'Unidade de Medida',
                hint: 'un, kg, par...',
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _imageUrlController,
                label: 'URL da Imagem',
                hint: 'https://...',
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _descriptionController,
                label: 'Descrição',
                hint: 'Detalhes do produto...',
                maxLines: 3,
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Text('Ativo', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                  const Spacer(),
                  Switch(
                    value: _isActive,
                    onChanged: (v) => setState(() => _isActive = v),
                    activeColor: const Color(0xFF6366F1),
                  ),
                ],
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
                      : Text('Salvar Produto', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white)),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
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
