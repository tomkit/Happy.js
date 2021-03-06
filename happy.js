(function($){
  function trim(el) {
    return (''.trim) ? el.val().trim() : $.trim(el.val());
  }
  // @thomas: deprecated
  $.fn.now = function() {
      $(this).submit();
  };
  
  $.fn.isHappy = function (config) {
    var fields = [], item;
    
    function getError(error) {
      return $('<span id="'+error.id+'" class="unhappyMessage">'+error.message+'</span>');
    }
    function handleSubmit(event) {
      var errors = false, i, l;
      for (i = 0, l = fields.length; i < l; i += 1) {
        if (!fields[i].testValid(true)) {
          errors = true;
        }
      }
      if (errors) {
        if (isFunction(config.unHappy)) config.unHappy();
        return false;
      } else if (config.testMode) {
        if (window.console) console.warn('would have submitted');
        return false;
      } else if (!errors) {
          if(isFunction(config.happy)) config.happy();
      }
      
      // @thomas: make this optional in the future
      event.preventDefault();
    }
    function isFunction (obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }
    function processField(opts, selector, scope) {
      var field = $(config.scope).find(selector),
        error = {
          message: opts.message,
          id: selector.slice(1) + '_unhappy'
        },
        errorEl = $(error.id).length > 0 ? $(error.id) : getError(error);
        
      fields.push(field);
      field.testValid = function (submit) {
        var val,
          el = $(this),
          gotFunc,
          error = false,
          temp, 
          required = !!el.get(0).attributes.getNamedItem('required') || opts.required,
          password = (field.attr('type') === 'password'),
          arg = isFunction(opts.arg) ? opts.arg() : opts.arg,
              
          // @thomas: forked: called in two places
          clearError = function() {
              temp = errorEl.get(0);
              
              // @thomas: forked: always clear error and not just append
              var id = errorEl.get(0).id;
              $(el.get(0).parentNode).find('#'+id).remove();
              $(el.get(0).parentNode).find('.unhappy').removeClass('unhappy');
              
              // this is for zepto
              if (temp.parentNode) {
                temp.parentNode.removeChild(temp);
              }
              
              
              el.removeClass('unhappy');
          };
        
        // clean it or trim it
        if (isFunction(opts.clean)) {
          val = opts.clean(el.val());
        } else if (!opts.trim && !password) {
          val = trim(el);
        } else {
          val = el.val();
        }
        
        // write it back to the field
        el.val(val);
        
        // get the value
        gotFunc = ((val.length > 0 || required === 'sometimes') && isFunction(opts.test));
        
        // check if we've got an error on our hands
        if (submit === true && required === true && val.length === 0) {
          error = true;
        } else if (gotFunc) {
          error = !opts.test(val, arg);
        }
        
        if (error) {
          clearError();
          
          el.addClass('unhappy').before(errorEl);
          return false;
        } else {
          clearError();
          return true;
        }
      };
      
      // @thomas: make this optional in the future. we don't need it 
//      field.unbind(config.when || 'blur', field.testValid);
//      field.bind(config.when || 'blur', field.testValid);
    }
    
    for (item in config.fields) {
      processField(config.fields[item], item, config.scope);
    }
    
    if (config.submitButton) {
      $(config.submitButton).click(handleSubmit);
    } else {
      this.unbind('submit'); // @thomas :forked: don't re-register listeners
      
      this.bind('submit', handleSubmit);
    }
    return this;
  };
})(this.jQuery || this.Zepto);