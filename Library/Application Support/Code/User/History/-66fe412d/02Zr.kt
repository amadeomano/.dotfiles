package com.personio.payroll.international.infrastructure.api

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.http.HttpMethod;

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
            //.securityMatcher(*apiDocPatterns)
            .authorizeHttpRequests {
                it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                it.requestMatchers(HttpMethod.GET, "/**").permitAll()
                it.requestMatchers(*apiDocPatterns).anonymous()
            }
            .addFilterBefore(localhostOriginFilter(), SecurityFilterChain::class.java)
            .build()
    }

    @Bean
    fun localhostOriginFilter(): Filter {
        return object : OncePerRequestFilter() {
            override fun doFilterInternal(
                request: HttpServletRequest, 
                response: HttpServletResponse, 
                filterChain: FilterChain
            ) {
                val origin = request.getHeader("Origin")

                // Allow any request from localhost:4200
                if (origin != null && origin.contains("http://localhost:4200")) {
                    response.setHeader("Access-Control-Allow-Origin", origin)
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
                    response.setHeader("Access-Control-Allow-Credentials", "true")
                    filterChain.doFilter(request, response)
                    return  // Skip further security filters
                }

                // If not from localhost:4200, continue the normal filter chain
                filterChain.doFilter(request, response)
            }

            override fun init(filterConfig: FilterConfig?) {}

            override fun destroy() {}
        }
    }
}
