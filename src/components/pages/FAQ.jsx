import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';

const FAQ = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is Literary Chat?",
          answer: "Literary Chat is an AI-powered platform that allows you to have conversations with your favorite literary characters. Using advanced AI technology, we've brought iconic characters from classic and contemporary literature to life, allowing you to chat with them as if they were real."
        },
        {
          question: "Is Literary Chat free to use?",
          answer: "Yes! Literary Chat offers a free tier that allows you to create an account and chat with our characters. We also offer premium features for users who want enhanced experiences, including longer conversation history and priority access to new characters."
        },
        {
          question: "How do I get started?",
          answer: "Simply create a free account by clicking the 'Sign Up' button, choose a character you'd like to chat with from our collection, and start your conversation! It's that easy."
        },
        {
          question: "Do I need to create an account?",
          answer: "Yes, you need to create a free account to save your conversations and chat with characters. This also allows us to provide you with a personalized experience and maintain your conversation history across sessions."
        }
      ]
    },
    {
      category: "Characters & Conversations",
      questions: [
        {
          question: "How many characters are available?",
          answer: "We currently have a growing collection of characters from classic and contemporary literature. Our library includes iconic figures like Sherlock Holmes, Elizabeth Bennet, Hermione Granger, and many more. We're constantly adding new characters based on user requests and literary significance."
        },
        {
          question: "How authentic are the character responses?",
          answer: "Our AI is trained to maintain each character's unique personality, speech patterns, and worldview as depicted in their original literary works. Characters respond in ways that are consistent with their backgrounds, time periods, and character development in their respective books."
        },
        {
          question: "Can I chat with multiple characters?",
          answer: "Absolutely! You can switch between characters at any time. Each conversation is saved separately, so you can maintain ongoing discussions with different characters and pick up where you left off."
        },
        {
          question: "Will characters know about modern events?",
          answer: "No, characters stay true to their literary time periods and contexts. For example, Sherlock Holmes won't know about smartphones or the internet. This authenticity helps maintain the immersive experience of chatting with these iconic figures."
        },
        {
          question: "Are conversations private?",
          answer: "Yes, your conversations are private and saved to your account. Only you can see your chat history with each character."
        }
      ]
    },
    {
      category: "Technical Questions",
      questions: [
        {
          question: "What technology powers Literary Chat?",
          answer: "Literary Chat uses advanced AI language models, specifically Claude AI by Anthropic, to generate authentic character responses. Our platform combines this AI with carefully crafted character profiles to ensure accurate and engaging conversations."
        },
        {
          question: "Can I access Literary Chat on mobile devices?",
          answer: "Yes! Literary Chat is fully responsive and works seamlessly on desktop computers, tablets, and smartphones. Simply access the website through your mobile browser."
        },
        {
          question: "Is there a mobile app?",
          answer: "Currently, Literary Chat is available as a web application. However, we're working on dedicated mobile apps for iOS and Android. Stay tuned by subscribing to our newsletter for updates!"
        },
        {
          question: "What if I encounter a technical issue?",
          answer: "If you experience any technical difficulties, please contact our support team through the Contact page. Include details about the issue, and we'll work to resolve it as quickly as possible."
        }
      ]
    },
    {
      category: "Account & Privacy",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "On the login page, click the 'Forgot Password' link. Enter your email address, and we'll send you instructions to reset your password securely."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account at any time from your account settings. Please note that this action is permanent and will delete all your conversation history."
        },
        {
          question: "How is my data used?",
          answer: "We take your privacy seriously. Your data is used solely to provide and improve our service. We never sell your personal information or share it with third parties. For complete details, please read our Privacy Policy."
        },
        {
          question: "Are my conversations used to train the AI?",
          answer: "Your conversations may be used in aggregate to improve our service quality, but they are anonymized and your personal information is never associated with this data. You can opt out of this in your privacy settings."
        }
      ]
    },
    {
      category: "Features & Content",
      questions: [
        {
          question: "Can I request new characters?",
          answer: "Yes! We love hearing suggestions from our community. You can submit character requests through our Contact page. While we can't guarantee every request will be added, we carefully consider all suggestions when planning new characters."
        },
        {
          question: "How often are new characters added?",
          answer: "We typically add new characters monthly. The frequency may vary based on development time and character complexity. Subscribe to our newsletter to be notified when new characters are available."
        },
        {
          question: "Can characters reference each other?",
          answer: "Characters are aware of other literary works and figures from their own time periods or earlier. However, they won't know about works published after their own stories were written."
        },
        {
          question: "Is there a limit to conversation length?",
          answer: "Free accounts can have conversations with a reasonable message limit per session. Premium accounts have extended or unlimited conversation lengths. Check our pricing page for specific details."
        }
      ]
    },
    {
      category: "Educational Use",
      questions: [
        {
          question: "Can teachers use Literary Chat in classrooms?",
          answer: "Absolutely! Many educators use Literary Chat as a supplementary tool to help students engage with literature. We offer educational discounts and group accounts for schools. Contact us for more information."
        },
        {
          question: "Is Literary Chat appropriate for students?",
          answer: "Yes, Literary Chat is designed to be educational and appropriate for students. All content is based on the original literary works and maintains the integrity of the source material."
        },
        {
          question: "Can Literary Chat help with homework?",
          answer: "While Literary Chat can provide insights into characters and their perspectives, it's designed as a supplementary tool for engagement and understanding, not as a replacement for reading the actual books or doing critical analysis."
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
                {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <HelpCircle className="w-12 h-12 md:w-16 md:h-16" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {t('faq.title')}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl">
              {t('faq.subtitle')}
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 pb-4 border-b-2 border-gray-200 text-gray-900">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === index;
                    return (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-base font-bold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="w-6 h-6 flex-shrink-0 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 flex-shrink-0 text-gray-400" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 pt-0">
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              {t('faq.stillHaveQuestions')}
            </h2>
            <p className="text-base text-gray-600 mb-8">
              {t('faq.cantFindAnswer')}
            </p>
            <Link
              to="/contact"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('faq.contactSupport')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
