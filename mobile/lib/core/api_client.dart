import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  late Dio dio;
  final storage = const FlutterSecureStorage();

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: 'https://api.consigo-backend-consigo.xc4mw1.easypanel.host', // Altere para o IP da sua máquina se testar em dispositivo real
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          final refreshToken = await storage.read(key: 'refreshToken');
          if (refreshToken != null) {
            try {
              final response = await Dio().post(
                '${dio.options.baseUrl}/auth/refresh',
                data: {'refreshToken': refreshToken},
              );
              
              final tokens = response.data['data'];
              await storage.write(key: 'accessToken', value: tokens['accessToken']);
              await storage.write(key: 'refreshToken', value: tokens['refreshToken']);

              // Repetir a requisição original
              final opts = e.requestOptions;
              opts.headers['Authorization'] = 'Bearer ${tokens['accessToken']}';
              final retryRes = await dio.fetch(opts);
              return handler.resolve(retryRes);
            } catch (err) {
              await storage.deleteAll();
              // Aqui você pode disparar um evento de logout global
            }
          }
        }
        return handler.next(e);
      },
    ));
  }
}
