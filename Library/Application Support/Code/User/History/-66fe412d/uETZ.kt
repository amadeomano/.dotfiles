package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

/**
 * This is needed to allow open api generation task to run successfully & swagger ui access in local,dev
 */
@Configuration
@Profile("local", "dev")
class OpenApiSecurityConfiguration {
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    fun customSecurityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain {
        val apiDocPatterns =
            arrayOf(
                "/v3/api-docs*/**",
                "/v3/api-docs.yaml",
                "/swagger-ui*/**",
            )
        return httpSecurity
            .securityMatcher(*apiDocPatterns)
            .authorizeHttpRequests {
                it.requestMatchers(*apiDocPatterns).anonymous()
            }.build()
    }

    // CORS Configuration for localhost:4200
    @Bean
    fun corsFilter(): CorsFilter {
        val corsConfig = CorsConfiguration()
        corsConfig.allowedOrigins = listOf("http://localhost:4200")  // Allow localhost:4200
        corsConfig.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Allowed HTTP methods
        corsConfig.allowedHeaders = listOf("Authorization", "Content-Type")  // Allowed headers
        corsConfig.allowCredentials = true  // Allow credentials like cookies, authorization headers

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", corsConfig)  // Apply CORS settings globally

        return CorsFilter(source)
    }
}
