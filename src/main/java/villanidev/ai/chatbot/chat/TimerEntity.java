package villanidev.ai.chatbot.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import java.util.List;
import java.util.TimerTask;


public class TimerEntity
 {

     private static final Logger log = LoggerFactory.getLogger(TimerEntity.class);

     public TimerEntity(){
         log.info("TimerEntity created");
         log.info("beanName: {}", this.getClass().toString());
         log.info(printDateTime());
    }

    public TimerEntity(String beanName){
        log.info("TimerEntity created");
        log.info("beanName: {}", beanName);
        log.info(printDateTime());
    }

    public String printDateTime(){
         return new java.util.Date().toString();
    }



 }
