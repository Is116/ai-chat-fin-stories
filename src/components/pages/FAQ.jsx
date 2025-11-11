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
      category: t('faq.categories.gettingStarted.title'),
      questions: [
        {
          question: t('faq.categories.gettingStarted.questions.whatIs.q'),
          answer: t('faq.categories.gettingStarted.questions.whatIs.a')
        },
        {
          question: t('faq.categories.gettingStarted.questions.isFree.q'),
          answer: t('faq.categories.gettingStarted.questions.isFree.a')
        },
        {
          question: t('faq.categories.gettingStarted.questions.howToStart.q'),
          answer: t('faq.categories.gettingStarted.questions.howToStart.a')
        },
        {
          question: t('faq.categories.gettingStarted.questions.needAccount.q'),
          answer: t('faq.categories.gettingStarted.questions.needAccount.a')
        }
      ]
    },
    {
      category: t('faq.categories.charactersConversations.title'),
      questions: [
        {
          question: t('faq.categories.charactersConversations.questions.howMany.q'),
          answer: t('faq.categories.charactersConversations.questions.howMany.a')
        },
        {
          question: t('faq.categories.charactersConversations.questions.authentic.q'),
          answer: t('faq.categories.charactersConversations.questions.authentic.a')
        },
        {
          question: t('faq.categories.charactersConversations.questions.multiple.q'),
          answer: t('faq.categories.charactersConversations.questions.multiple.a')
        },
        {
          question: t('faq.categories.charactersConversations.questions.modernEvents.q'),
          answer: t('faq.categories.charactersConversations.questions.modernEvents.a')
        },
        {
          question: t('faq.categories.charactersConversations.questions.private.q'),
          answer: t('faq.categories.charactersConversations.questions.private.a')
        }
      ]
    },
    {
      category: t('faq.categories.technical.title'),
      questions: [
        {
          question: t('faq.categories.technical.questions.technology.q'),
          answer: t('faq.categories.technical.questions.technology.a')
        },
        {
          question: t('faq.categories.technical.questions.mobile.q'),
          answer: t('faq.categories.technical.questions.mobile.a')
        },
        {
          question: t('faq.categories.technical.questions.mobileApp.q'),
          answer: t('faq.categories.technical.questions.mobileApp.a')
        },
        {
          question: t('faq.categories.technical.questions.techIssue.q'),
          answer: t('faq.categories.technical.questions.techIssue.a')
        }
      ]
    },
    {
      category: t('faq.categories.accountPrivacy.title'),
      questions: [
        {
          question: t('faq.categories.accountPrivacy.questions.resetPassword.q'),
          answer: t('faq.categories.accountPrivacy.questions.resetPassword.a')
        },
        {
          question: t('faq.categories.accountPrivacy.questions.deleteAccount.q'),
          answer: t('faq.categories.accountPrivacy.questions.deleteAccount.a')
        },
        {
          question: t('faq.categories.accountPrivacy.questions.dataUse.q'),
          answer: t('faq.categories.accountPrivacy.questions.dataUse.a')
        },
        {
          question: t('faq.categories.accountPrivacy.questions.aiTraining.q'),
          answer: t('faq.categories.accountPrivacy.questions.aiTraining.a')
        }
      ]
    },
    {
      category: t('faq.categories.featuresContent.title'),
      questions: [
        {
          question: t('faq.categories.featuresContent.questions.requestCharacters.q'),
          answer: t('faq.categories.featuresContent.questions.requestCharacters.a')
        },
        {
          question: t('faq.categories.featuresContent.questions.newCharacters.q'),
          answer: t('faq.categories.featuresContent.questions.newCharacters.a')
        },
        {
          question: t('faq.categories.featuresContent.questions.reference.q'),
          answer: t('faq.categories.featuresContent.questions.reference.a')
        },
        {
          question: t('faq.categories.featuresContent.questions.limit.q'),
          answer: t('faq.categories.featuresContent.questions.limit.a')
        }
      ]
    },
    {
      category: t('faq.categories.educational.title'),
      questions: [
        {
          question: t('faq.categories.educational.questions.teachers.q'),
          answer: t('faq.categories.educational.questions.teachers.a')
        },
        {
          question: t('faq.categories.educational.questions.appropriate.q'),
          answer: t('faq.categories.educational.questions.appropriate.a')
        },
        {
          question: t('faq.categories.educational.questions.homework.q'),
          answer: t('faq.categories.educational.questions.homework.a')
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
