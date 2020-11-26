const ajax = options =>
  new Promise((resolve, reject) => {
    $.ajax({
      cache: false,
      method: 'GET',
      success: resolve,
      error: reject,
      ...options
    });
  });

const showAlertMessage = options => {
  const alertMessage = $(
    `<div class="alert ${options.variant || 'alert-primary'} alert-dismissible show fade in" role="alert" id="myAlert">
          ${options.content || 'Ocorreu um erro. Por favor, tente mais tarde'}
          <button class="btn close" data-dismiss="alert" aria-label="close">
              <i class="fa fa-times"></i>
          </button>
      </div>`
  );
  $('body').append(alertMessage);
  setTimeout(() => {
    $(alertMessage).alert('close');
  }, options.timeout || 5000);
};

const loadingIcon = visible => {
  if (visible === true) {
    const spinner = $('<img class=" " src="/assets/images/loading.gif" id="spinner"></img>');
    $('body').append(spinner);
  } else {
    $('#spinner').remove();
  }
};
