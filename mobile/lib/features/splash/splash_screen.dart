import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_client.dart';
import '../auth/login_screen.dart';
import '../dashboard/main_navigation_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    // Garantir que a splash dure pelo menos 2.5 segundos para o usuário ver a marca
    await Future.delayed(const Duration(milliseconds: 2500));
    
    final storage = ApiClient().storage;
    final token = await storage.read(key: 'accessToken');
    
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => token != null 
              ? const MainNavigationScreen() 
              : const LoginScreen(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeInDown(
              duration: const Duration(milliseconds: 1000),
              child: Container(
                width: 120,
                height: 120,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                      blurRadius: 30,
                      offset: const Offset(0, 15),
                    ),
                  ],
                ),
                child: Image.asset('assets/images/logo.png'),
              ),
            ),
            const SizedBox(height: 30),
            FadeInUp(
              duration: const Duration(milliseconds: 1000),
              child: Column(
                children: [
                  Text(
                    'CONSIGO',
                    style: GoogleFonts.outfit(
                      fontSize: 42,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 4,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'GESTÃO INTELIGENTE',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white.withOpacity(0.5),
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
