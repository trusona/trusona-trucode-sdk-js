# frozen_string_literal: true

require 'rspec/core/rake_task'
require 'rubocop/rake_task'

RuboCop::RakeTask.new(:rubocop) do |t|
  t.options = ['--display-cop-names']
end

ENV['SAUCE_START_TIME'] = "Gateway: Local-#{Time.now.to_i}"
ENV['PARALLEL_SPLIT_TEST_PROCESSES'] = '2'

def error(browser)
  raise "Failed #{browser} specs suite"
end

desc 'Run tests in parallel within suite using IE11'
task :ie11 do
  ENV['BROWSER_NAME'] = 'ie11'
  puts "Running spec against #{ENV['BROWSER_NAME']}..."
  system 'parallel_split_test spec' or error(ENV['BROWSER_NAME'])
end

desc 'Run tests in parallel within suite using Edge'
task :edge do
  ENV['BROWSER_NAME'] = 'edge'
  puts "Running spec against #{ENV['BROWSER_NAME']}..."
  system 'parallel_split_test spec' or error(ENV['BROWSER_NAME'])
end

desc 'Run tests in parallel within suite using Safari'
task :safari do
  ENV['BROWSER_NAME'] = 'safari'
  puts "Running spec against #{ENV['BROWSER_NAME']}..."
  system 'parallel_split_test spec' or error(ENV['BROWSER_NAME'])
end

desc 'Run tests in parallel within suite using Firefox'
task :firefox do
  ENV['BROWSER_NAME'] = 'firefox'
  puts "Running spec against #{ENV['BROWSER_NAME']}..."
  system 'parallel_split_test spec' or error(ENV['BROWSER_NAME'])
end

desc 'Run tests in parallel within suite using Chrome'
task :chrome do
  ENV['BROWSER_NAME'] = 'chrome'
  puts "Running spec against #{ENV['BROWSER_NAME']}..."
  system 'parallel_split_test spec' or error(ENV['BROWSER_NAME'])
end

task :default do
  [:ie11, :edge, :safari, :firefox, :chrome].each { |browser| Rake::Task[browser].execute }
end
