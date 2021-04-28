# frozen_string_literal: true

require 'capybara'
require 'capybara/rspec'
require 'selenium-webdriver'
require 'rspec'
require 'sauce_whisk'

Capybara.default_max_wait_time = 10

RSpec.configure do |config|
  config.include Capybara::DSL
  config.include Capybara::RSpecMatchers

  config.before do |test|
    Capybara.always_include_port = true

    Capybara.register_driver :sauce do |app|
      url = 'https://ondemand.us-west-1.saucelabs.com/wd/hub'
      SauceWhisk.data_center = :US_WEST

      options = { 'sauce:options': { name: test.full_description,
                                     build: build_name,
                                     username: ENV['SAUCE_USERNAME'],
                                     access_key: ENV['SAUCE_ACCESS_KEY'] } }
      case ENV['BROWSER_NAME']
      when 'safari'
        desired_capabilities = Selenium::WebDriver::Remote::Capabilities.safari(options)
      when 'firefox'
        desired_capabilities = Selenium::WebDriver::Remote::Capabilities.firefox(options)
      when 'edge'
        desired_capabilities = Selenium::WebDriver::Remote::Capabilities.edge(options)
      when 'ie11'
        desired_capabilities = Selenium::WebDriver::Remote::Capabilities.internet_explorer(options)
      else
        desired_capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(options)
      end

      Capybara::Selenium::Driver.new(app,
                                     browser: :remote,
                                     url: url,
                                     desired_capabilities: desired_capabilities)
    end
    Capybara.current_driver = :sauce
  end

  config.after do |test|
    session_id = Capybara.current_session.driver.browser.session_id
    SauceWhisk::Jobs.change_status(session_id, !test.exception)
    Capybara.current_session.quit
  end

  def build_name
    if ENV['TRAVIS']
      "#{ENV['TRAVIS_REPO_SLUG']}: #{ENV['TRAVIS_JOB_NUMBER']}"
    elsif ENV['SAUCE_START_TIME']
      ENV['SAUCE_START_TIME']
    else
      "Gateway: Local-#{Time.now.to_i}"
    end
  end
end
