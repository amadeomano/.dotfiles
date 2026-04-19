package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

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

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        // Local personio-web monorepo orchestrator
        configuration.allowedOrigins = listOf("http://localhost:4200")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Allow specific HTTP methods
        configuration.allowedHeaders = listOf("Authorization", "Content-Type")  // Specify allowed headers
        configuration.allowCredentials = true  // Allow credentials if needed

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)  // Apply this CORS configuration to all paths
        return source
    }

    @Bean
    @Order(Ordered.LOWEST_PRECEDENCE)
    fun globalSecurityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain {
        return httpSecurity
            .cors().and()
            .build()
    }
}
