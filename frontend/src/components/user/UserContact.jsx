import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function UserContact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in <span className="text-rose-500">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our student exchange platform? Reach out to us anytime - we're here to help!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Information */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-2 border-b-2 border-rose-500 inline-block">
                Contact Information
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <FaPhone className="text-rose-500 text-xl" />,
                    title: "Phone",
                    details: "+91 76961 73705",
                    description: "Mon-Fri, 9am-6pm"
                  },
                  {
                    icon: <FaEnvelope className="text-violet-500 text-xl" />,
                    title: "Email",
                    details: "support@studentexchange.com",
                    description: "We reply within 24 hours"
                  },
                  {
                    icon: <FaMapMarkerAlt className="text-rose-500 text-xl" />,
                    title: "Office",
                    details: "123 University Road, Academic District",
                    description: "Mumbai, Maharashtra 400001"
                  },
                  {
                    icon: <FaClock className="text-violet-500 text-xl" />,
                    title: "Hours",
                    details: "Monday - Friday: 9AM - 6PM",
                    description: "Saturday: 10AM - 4PM"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="p-3 bg-gray-100 rounded-full mr-4">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-900 font-medium">{item.details}</p>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Social Media */}
              <div className="mt-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {[
                    { icon: <FaFacebook className="h-5 w-5" />, color: "bg-blue-600" },
                    { icon: <FaTwitter className="h-5 w-5" />, color: "bg-sky-500" },
                    { icon: <FaInstagram className="h-5 w-5" />, color: "bg-gradient-to-r from-rose-500 to-amber-500" },
                    { icon: <FaLinkedin className="h-5 w-5" />, color: "bg-blue-700" }
                  ].map((social, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className={`${social.color} w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-2 border-b-2 border-violet-500 inline-block">
                Send Us a Message
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="What's this regarding?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold py-4 px-6 rounded-lg hover:from-violet-700 hover:to-rose-600 transition-all duration-300 shadow-lg"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Map Section */}
            <div className="mt-10 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-80 bg-gray-200 flex items-center justify-center">
                <img src="/assets/images/map-2.jpg" alt="map-2.jpg" />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 bg-gradient-to-r from-violet-50 to-rose-50 rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked <span className="text-violet-600">Questions</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How quickly do you respond to inquiries?",
                answer: "We typically respond to all inquiries within 24 hours during business days."
              },
              {
                question: "Can I exchange study materials internationally?",
                answer: "Yes, we facilitate both local and international exchanges between students."
              },
              {
                question: "Is there a fee to use the exchange platform?",
                answer: "No, our basic exchange services are completely free for all students."
              },
              {
                question: "How do I ensure the quality of materials I receive?",
                answer: "All materials are rated by students and we have a verification process."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="bg-rose-500 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm mr-3">Q</span>
                  {faq.question}
                </h3>
                <p className="text-gray-700 mt-3 ml-9">
                  <span className="bg-violet-500 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm mr-3 float-left">A</span>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}