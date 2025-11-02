package villanidev.ai.chatbot.chat;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    // Expose ItemStore as a Spring bean with custom init/destroy mapped
    @Bean(initMethod = "init", destroyMethod = "shutdown")
    public ItemStore itemStore() {
        return new ItemStoreImpl();
    }

    // Expose TimerEntity as a Spring bean with custom init/destroy mapped
    @Bean
    public TimerEntity timerEntity() {
        return new TimerEntity("TimerEntityImpl");
    }


}