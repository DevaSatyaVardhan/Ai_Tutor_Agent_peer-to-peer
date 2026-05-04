package com.anu.peerlearning.config;

import com.anu.peerlearning.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()
                .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers("/error").permitAll()
                .antMatchers("/auth/**").permitAll()
                .antMatchers("/ai/**").permitAll()  // AI gateway endpoints
                .antMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .antMatchers(HttpMethod.GET, "/videos/**").permitAll()
                .antMatchers(HttpMethod.GET, "/students/count").permitAll()
                .antMatchers(HttpMethod.POST, "/students/register").permitAll()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/admin/videos/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/admin/students/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.POST, "/videos/upload").hasAnyRole("ADMIN", "STUDENT")
                .antMatchers(HttpMethod.POST, "/videos/upload-file").hasAnyRole("ADMIN", "STUDENT")
                .antMatchers(HttpMethod.DELETE, "/videos/**").hasAnyRole("ADMIN", "STUDENT")
                .antMatchers(HttpMethod.POST, "/videos/**/comments").hasAnyRole("ADMIN", "STUDENT")
                .antMatchers(HttpMethod.POST, "/videos/**/likes").hasAnyRole("ADMIN", "STUDENT")
                .anyRequest().authenticated()
                .and()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .formLogin().disable()
                .httpBasic().disable();

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow localhost dev servers and file:// pages (Origin: null) during local development.
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://127.0.0.1:*", "null"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
