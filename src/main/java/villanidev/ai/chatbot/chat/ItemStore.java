package villanidev.ai.chatbot.chat;


import java.util.List;

public interface ItemStore {
    void add(String item);
    boolean delete(String item);
    List<String> list();

    void init();

    void shutdown();
}
