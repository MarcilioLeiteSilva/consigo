import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';

class PosFormScreen extends StatefulWidget {
  final POS? pos;
  const PosFormScreen({super.key, this.pos});

  @override
  State<PosFormScreen> createState() => _PosFormScreenState();
}

class _PosFormScreenState extends State<PosFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiClient _api = ApiClient();
  bool _isLoading = false;

  late TextEditingController _nameController;
  late TextEditingController _responsibleController;
  late TextEditingController _documentController;
  late TextEditingController _whatsappController;
  late TextEditingController _emailController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _locationController;
  late TextEditingController _commissionController;
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.pos?.name ?? '');
    _responsibleController = TextEditingController(text: widget.pos?.responsibleName ?? '');
    _documentController = TextEditingController(text: widget.pos?.document ?? '');
    _whatsappController = TextEditingController(text: widget.pos?.whatsapp ?? '');
    _emailController = TextEditingController(text: widget.pos?.email ?? '');
    _cityController = TextEditingController(text: widget.pos?.city ?? '');
    _stateController = TextEditingController(text: widget.pos?.state ?? '');
    _locationController = TextEditingController(text: widget.pos?.location ?? '');
    _commissionController = TextEditingController(text: widget.pos?.defaultCommission.toString() ?? '25.0');
    _isActive = widget.pos?.isActive ?? true;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final data = {
        'name': _nameController.text,
        'responsibleName': _responsibleController.text,
        'document': _documentController.text,
        'whatsapp': _whatsappController.text,
        'email': _emailController.text,
        'city': _cityController.text,
        'state': _stateController.text,
        'location': _locationController.text,
        'defaultCommission': _commissionController.text,
        'isActive': _isActive,
      };

      if (widget.pos == null) {
        await _api.dio.post('/pos', data: data);
      } else {
        await _api.dio.patch('/pos/${widget.pos!.id}', data: data);
      }

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDV ${widget.pos == null ? 'criado' : 'atualizado'} com sucesso')),
        );
      }
    } catch (e) {
      debugPrint('Erro ao salvar PDV: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erro ao salvar PDV. Verifique os dados.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.pos != null;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          isEditing ? 'Editar PDV' : 'Novo PDV',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
        ),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(25),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('Informações Básicas'),
              _buildTextField(
                controller: _nameController,
                label: 'Nome do PDV',
                hint: 'Ex: Loja Centro',
                validator: (v) => v!.isEmpty ? 'Obrigatório' : null,
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _responsibleController,
                label: 'Responsável',
                hint: 'Nome do contato',
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _documentController,
                label: 'Documento (CPF/CNPJ)',
                hint: '00.000.000/0001-00',
              ),
              
              const SizedBox(height: 30),
              _buildSectionTitle('Contato'),
              _buildTextField(
                controller: _whatsappController,
                label: 'WhatsApp',
                hint: '11999998888',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _emailController,
                label: 'E-mail',
                hint: 'contato@pdv.com',
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 30),
              _buildSectionTitle('Localização'),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: _buildTextField(
                      controller: _cityController,
                      label: 'Cidade',
                      hint: 'Ex: São Paulo',
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildTextField(
                      controller: _stateController,
                      label: 'UF',
                      hint: 'SP',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              _buildTextField(
                controller: _locationController,
                label: 'Endereço Completo',
                hint: 'Rua, número, bairro...',
              ),

              const SizedBox(height: 30),
              _buildSectionTitle('Configurações'),
              _buildTextField(
                controller: _commissionController,
                label: 'Comissão Padrão (%)',
                hint: '25.0',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Text(
                    'PDV Ativo',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
                  ),
                  const Spacer(),
                  Switch(
                    value: _isActive,
                    onChanged: (v) => setState(() => _isActive = v),
                    activeColor: const Color(0xFF6366F1),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          isEditing ? 'Salvar Alterações' : 'Criar PDV',
                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Text(
        title,
        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF475569)),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF64748B)),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          style: GoogleFonts.inter(color: const Color(0xFF0F172A)),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.inter(color: const Color(0xFFCBD5E1)),
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
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF6366F1), width: 2),
            ),
          ),
        ),
      ],
    );
  }
}
