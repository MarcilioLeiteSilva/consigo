import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_client.dart';
import '../../core/models.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final ApiClient _api = ApiClient();
  UserProfile? _profile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.dio.get('/auth/me');
      setState(() {
        _profile = UserProfile.fromJson(response.data['data'] ?? response.data);
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar perfil: $e');
      setState(() => _isLoading = false);
    }
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Sair', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: const Text('Deseja realmente encerrar sua sessão?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancelar', style: GoogleFonts.inter(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              await _api.logout();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: Text('Sair', style: GoogleFonts.inter(color: Colors.redAccent, fontWeight: FontWeight.w700)),
          ),
        ],
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
        title: Row(
          children: [
            Image.asset('assets/images/logo.png', height: 24),
            const SizedBox(width: 10),
            Text(
              'Configurações',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(25),
              child: Column(
                children: [
                  // Profile Header
                  FadeInDown(
                    duration: const Duration(milliseconds: 500),
                    child: Container(
                      padding: const EdgeInsets.all(25),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFFA855F7)]),
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF6366F1).withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 35,
                            backgroundColor: Colors.white.withOpacity(0.2),
                            child: Text(
                              (_profile?.name != null && _profile!.name.isNotEmpty) 
                                ? _profile!.name.substring(0, 1).toUpperCase() 
                                : 'U',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _profile?.name ?? 'Usuário',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                Text(
                                  _profile?.email ?? 'email@exemplo.com',
                                  style: GoogleFonts.inter(fontSize: 14, color: Colors.white.withOpacity(0.8)),
                                ),
                                const SizedBox(height: 5),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    _profile?.role.toUpperCase() ?? 'OPERADOR',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 35),

                  // Settings Sections
                  _buildSection('Conta e Empresa'),
                  _buildSettingItem(
                    icon: Icons.business_outlined,
                    title: 'Minha Loja',
                    subtitle: _profile?.companyName ?? 'Consigo SaaS',
                    color: Colors.blueAccent,
                  ),
                  _buildSettingItem(
                    icon: Icons.person_outline,
                    title: 'Meus Dados',
                    subtitle: 'Editar informações pessoais',
                    color: Colors.orangeAccent,
                  ),
                  
                  const SizedBox(height: 25),
                  _buildSection('Preferências'),
                  _buildSettingItem(
                    icon: Icons.notifications_none,
                    title: 'Notificações',
                    subtitle: 'Alertas de estoque e vendas',
                    color: Colors.purpleAccent,
                  ),
                  _buildSettingItem(
                    icon: Icons.security_outlined,
                    title: 'Segurança',
                    subtitle: 'Alterar senha e privacidade',
                    color: Colors.greenAccent,
                  ),

                  const SizedBox(height: 25),
                  _buildSection('Suporte'),
                  _buildSettingItem(
                    icon: Icons.help_outline,
                    title: 'Central de Ajuda',
                    subtitle: 'Tutoriais e suporte técnico',
                    color: Colors.teal,
                  ),
                  _buildSettingItem(
                    icon: Icons.info_outline,
                    title: 'Sobre o App',
                    subtitle: 'Versão 1.0.0-gold',
                    color: Colors.grey,
                  ),

                  const SizedBox(height: 40),
                  // Logout Button
                  FadeInUp(
                    child: SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: TextButton(
                        onPressed: _handleLogout,
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                            side: const BorderSide(color: Colors.redAccent, width: 1.5),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.logout),
                            const SizedBox(width: 10),
                            Text('Encerrar Sessão', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }

  Widget _buildSection(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 5, bottom: 15),
        child: Text(
          title,
          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF64748B), letterSpacing: 0.5),
        ),
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A))),
                Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1), size: 18),
        ],
      ),
    );
  }
}
