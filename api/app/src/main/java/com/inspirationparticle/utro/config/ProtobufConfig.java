package com.inspirationparticle.utro.config;

import com.google.protobuf.util.JsonFormat;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.protobuf.ProtobufJsonFormatHttpMessageConverter;

@Configuration
public class ProtobufConfig {

    @Bean
    public ProtobufJsonFormatHttpMessageConverter protobufJsonFormatHttpMessageConverter() {
        JsonFormat.Parser parser = JsonFormat.parser()
                .ignoringUnknownFields();
        
        JsonFormat.Printer printer = JsonFormat.printer()
                .includingDefaultValueFields()
                .preservingProtoFieldNames();
        
        return new ProtobufJsonFormatHttpMessageConverter(parser, printer);
    }
}