# frozen_string_literal: true

require 'spec_helper'

describe 'render trucode' do
  before { visit 'http://localhost:9080/examples/render-tru-code.html' }

  it 'displays a very beautiful QR code' do
    expect(page).to have_selector(:id, 'qr-code', visible: true)
  end
end
