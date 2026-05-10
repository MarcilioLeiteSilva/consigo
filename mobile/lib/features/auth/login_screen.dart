import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../dashboard/main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: Stack(
        children: [
          // Background Gradients
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF6366F1).withOpacity(0.15),
              ),
            ),
          ),
          Positioned(
            bottom: -150,
            right: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFA855F7).withOpacity(0.1),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 60),
                  
                  // Logo & Title
                  FadeInDown(
                    duration: const Duration(milliseconds: 600),
                    child: Center(
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(15),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF6366F1), Color(0xFFA855F7)],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF6366F1).withOpacity(0.4),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Image.asset('assets/images/logo.png', height: 40, width: 40),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Consigo',
                            style: GoogleFonts.outfit(
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -1,
                            ),
                          ),
                          Text(
                            'Gestão Inteligente de Consignados',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.5),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 60),

                  // Form
                  FadeInUp(
                    delay: const Duration(milliseconds: 200),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('E-mail'),
                        _buildTextField(
                          controller: _emailController,
                          hint: 'exemplo@email.com',
                          icon: Icons.email_outlined,
                        ),
                        const SizedBox(height: 20),
                        _buildLabel('Senha'),
                        _buildTextField(
                          controller: _passwordController,
                          hint: '••••••••',
                          icon: Icons.lock_outline,
                          isPassword: true,
                          obscure: _obscurePassword,
                          toggleObscure: () {
                            setState(() => _obscurePassword = !_obscurePassword);
                          },
                        ),
                        const SizedBox(height: 10),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {},
                            child: Text(
                              'Esqueceu a senha?',
                              style: GoogleFonts.inter(
                                color: const Color(0xFF6366F1),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Login Button
                  FadeInUp(
                    delay: const Duration(milliseconds: 400),
                    child: SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                          elevation: 0,
                        ).copyWith(
                          backgroundColor: WidgetStateProperty.all(Colors.transparent),
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6366F1), Color(0xFFA855F7)],
                            ),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          alignment: Alignment.center,
                          child: _isLoading
                              ? const SpinKitThreeBounce(color: Colors.white, size: 20)
                              : Text(
                                  'Entrar',
                                  style: GoogleFonts.inter(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  // Support footer
                  Center(
                    child: Text.rich(
                      TextSpan(
                        text: 'Problemas no acesso? ',
                        style: GoogleFonts.inter(color: Colors.white.withOpacity(0.5)),
                        children: [
                          TextSpan(
                            text: 'Suporte',
                            style: GoogleFonts.inter(
                              color: const Color(0xFF6366F1),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        text,
        style: GoogleFonts.inter(
          color: Colors.white.withOpacity(0.7),
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    bool obscure = false,
    VoidCallback? toggleObscure,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: GoogleFonts.inter(color: Colors.white),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.inter(color: Colors.white.withOpacity(0.3)),
          prefixIcon: Icon(icon, color: Colors.white.withOpacity(0.5), size: 20),
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                    obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: Colors.white.withOpacity(0.5),
                    size: 20,
                  ),
                  onPressed: toggleObscure,
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
        ),
      ),
    );
  }

  void _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, preencha todos os campos')),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      final response = await ApiClient().dio.post('/auth/login', data: {
        'email': _emailController.text,
        'password': _passwordController.text,
      });

      final data = response.data['data'];
      final storage = ApiClient().storage;
      
      await storage.write(key: 'accessToken', value: data['accessToken']);
      await storage.write(key: 'refreshToken', value: data['refreshToken']);
      
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
        );
      }
    } catch (e) {
      String message = 'Erro ao realizar login. Tente novamente.';
      if (e is DioException) {
        if (e.response?.statusCode == 401) {
          message = 'E-mail ou senha inválidos.';
        } else {
          message = e.response?.data?['message'] ?? message;
        }
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}
